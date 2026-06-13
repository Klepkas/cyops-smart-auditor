/**
 * Placeholder Solidity contract shown in the Auditor editor on first load.
 *
 * The contract is intentionally vulnerable — it contains demo flaws that the
 * AC-5 / AC-6 scan pipeline will surface (reentrancy, tx.origin usage,
 * unchecked low-level call return value). It is **not** production code and
 * is meant purely to give the simulated scan something to "find".
 */
export const SAMPLE_CONTRACT_NAME = 'VulnerableVault.sol';

export const SAMPLE_CONTRACT = String.raw`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VulnerableVault
 * @notice Demo contract with intentional flaws for the Smart Contract Auditor.
 * @dev    DO NOT USE IN PRODUCTION — every "issue" listed below is on purpose
 *         so the simulated scan has something realistic to find. The flaws
 *         are surfaced by the multi-agent pipeline in AC-5 / AC-6.
 */
contract VulnerableVault {
    mapping(address => uint256) public balances;
    address public owner;

    event Withdrawn(address indexed user, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    /// Accept deposits and credit the caller's balance.
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    /// Reentrancy: external call happens BEFORE the state update.
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount, "insufficient balance");
        (bool ok, ) = msg.sender.call{value: amount}("");
        balances[msg.sender] -= amount;
        require(ok, "transfer failed");
        emit Withdrawn(msg.sender, amount);
    }

    /// tx.origin-based authentication.
    function adminWithdraw(uint256 amount) public {
        require(tx.origin == owner, "not owner");
        payable(owner).transfer(amount);
    }

    /// Unchecked low-level call return value.
    function forward(address payable to, uint256 amount) public {
        to.call{value: amount}("");
    }

    /// Allows the contract to receive raw ETH (forwards from withdraw).
    receive() external payable {}
}
`;

/** Default Solidity version pre-selected in the version selector (AC-9). */
export const DEFAULT_SOLIDITY_VERSION = '0.8.20';
