// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Casino is Ownable, ReentrancyGuard {
    // Events
    event CoinFlipPlayed(
        address indexed player,
        uint256 bet,
        bool choice,
        bool result,
        bool win,
        uint256 payout
    );

    event RoulettePlayed(
        address indexed player,
        uint256 bet,
        uint8 betType,
        uint8 betNumber,
        uint8 resultNumber,
        bool win,
        uint256 payout
    );

    event SlotsPlayed(
        address indexed player,
        uint256 bet,
        uint8[3] symbols,
        bool win,
        uint256 payout
    );

    event CasinoFunded(address indexed owner, uint256 amount);
    event ProfitsWithdrawn(address indexed owner, uint256 amount);

    constructor() Ownable(msg.sender) {}

    // --- Modifiers & Helpers ---

    modifier validBet() {
        require(msg.value > 0, "Bet must be greater than zero");
        _;
    }

    function _random(uint256 mod) internal view returns (uint256) {
        // Pseudo-randomness suitable for testnet/demo only
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        block.timestamp,
                        msg.sender,
                        block.prevrandao,
                        block.number
                    )
                )
            ) % mod;
    }

    function _ensurePayoutPossible(uint256 potentialPayout) internal view {
        require(
            potentialPayout <= address(this).balance,
            "Casino: insufficient liquidity for payout"
        );
    }

    // --- Bankroll Management ---

    function fundCasino() external payable onlyOwner {
        require(msg.value > 0, "Must send funds");
        emit CasinoFunded(msg.sender, msg.value);
    }

    function withdrawProfits(uint256 amount) external onlyOwner nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(
            amount <= address(this).balance,
            "Casino: insufficient balance"
        );
        (bool ok, ) = owner().call{value: amount}("");
        require(ok, "Withdraw failed");
        emit ProfitsWithdrawn(owner(), amount);
    }

    function getCasinoBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // --- Coin Flip ---
    // heads = true, tails = false
    function playCoinFlip(bool heads)
        external
        payable
        nonReentrant
        validBet
    {
        uint256 bet = msg.value;
        // 2x payout on win (original bet + winnings)
        uint256 potentialPayout = bet * 2;
        _ensurePayoutPossible(potentialPayout);

        bool flipResult = _random(2) == 0;
        bool win = (heads && flipResult) || (!heads && !flipResult);
        uint256 payout = 0;

        if (win) {
            payout = potentialPayout;
            (bool ok, ) = msg.sender.call{value: payout}("");
            require(ok, "Coin flip payout failed");
        }

        emit CoinFlipPlayed(
            msg.sender,
            bet,
            heads,
            flipResult,
            win,
            payout
        );
    }

    // --- Roulette ---
    // betType: 0=Red,1=Black,2=Even,3=Odd,4=Exact Number
    // number: only used when betType == 4
    function playRoulette(uint8 betType, uint8 number)
        external
        payable
        nonReentrant
        validBet
    {
        require(betType <= 4, "Invalid bet type");
        if (betType == 4) {
            require(number <= 36, "Invalid number");
        }

        uint256 bet = msg.value;
        uint256 multiplier;

        if (betType == 4) {
            // exact number 36x per spec
            multiplier = 36;
        } else {
            // color/parity bets 2x payout (1x winnings)
            multiplier = 2;
        }

        uint256 potentialPayout = bet * multiplier;
        _ensurePayoutPossible(potentialPayout);

        uint8 resultNumber = uint8(_random(37)); // 0-36
        bool isRed = _isRed(resultNumber);
        bool isEven = resultNumber != 0 && (resultNumber % 2 == 0);

        bool win = false;

        if (betType == 0) {
            // Red
            win = isRed;
        } else if (betType == 1) {
            // Black
            win = (resultNumber != 0) && !isRed;
        } else if (betType == 2) {
            // Even
            win = isEven;
        } else if (betType == 3) {
            // Odd
            win = (resultNumber != 0) && !isEven;
        } else if (betType == 4) {
            // Exact number
            win = (resultNumber == number);
        }

        uint256 payout = 0;
        if (win) {
            payout = potentialPayout;
            (bool ok, ) = msg.sender.call{value: payout}("");
            require(ok, "Roulette payout failed");
        }

        emit RoulettePlayed(
            msg.sender,
            bet,
            betType,
            number,
            resultNumber,
            win,
            payout
        );
    }

    function _isRed(uint8 n) internal pure returns (bool) {
        // 0 is green
        if (n == 0) return false;
        uint8[18] memory redNumbers = [
            uint8(1),
            3,
            5,
            7,
            9,
            12,
            14,
            16,
            18,
            19,
            21,
            23,
            25,
            27,
            30,
            32,
            34,
            36
        ];
        for (uint256 i = 0; i < redNumbers.length; i++) {
            if (n == redNumbers[i]) {
                return true;
            }
        }
        return false;
    }

    // --- Slots ---
    // Symbols are represented as numbers 0-5
    function playSlots() external payable nonReentrant validBet {
        uint256 bet = msg.value;

        uint8[3] memory symbols;
        for (uint256 i = 0; i < 3; i++) {
            symbols[i] = uint8(_random(6));
        }

        (bool win, uint256 multiplier) = _evaluateSlots(symbols);
        uint256 payout = 0;

        if (win && multiplier > 0) {
            uint256 potentialPayout = bet * multiplier;
            _ensurePayoutPossible(potentialPayout);
            payout = potentialPayout;
            (bool ok, ) = msg.sender.call{value: payout}("");
            require(ok, "Slots payout failed");
        }

        emit SlotsPlayed(msg.sender, bet, symbols, win, payout);
    }

    function _evaluateSlots(uint8[3] memory symbols)
        internal
        pure
        returns (bool, uint256)
    {
        uint8 s1 = symbols[0];
        uint8 s2 = symbols[1];
        uint8 s3 = symbols[2];

        if (s1 == s2 && s2 == s3) {
            // 3 equal symbols -> 5x
            return (true, 5);
        }

        if (s1 == s2 || s2 == s3 || s1 == s3) {
            // any 2 equal -> 2x
            return (true, 2);
        }

        return (false, 0);
    }
}

