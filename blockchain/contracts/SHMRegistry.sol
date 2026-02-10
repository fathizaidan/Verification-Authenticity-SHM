// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SHMRegistry {

    // ================================
    // STRUCT
    // ================================
    struct SHM {
        string certNumber;
        string cid;
        bytes32 documentHash;
        string ownerName;
        string ownerNIK;
        bool verified;
        bool revoked;
        uint256 createdAt;
    }

    struct History {
        string action;
        address actor;
        string owner;
        string nik;
        uint256 timestamp;
    }

    // ================================
    // ROLES
    // ================================
    enum Role { USER, ADMIN_BPN }
    mapping(address => Role) public roles;

    // ================================
    // STORAGE
    // ================================
    mapping(string => SHM) private shms;
    mapping(string => History[]) private histories;

    address public admin;

    // ================================
    // MODIFIER
    // ================================
    modifier onlyAdmin() {
        require(roles[msg.sender] == Role.ADMIN_BPN, "Only Admin/BPN");
        _;
    }

    // ================================
    // CONSTRUCTOR
    // ================================
    constructor() {
        admin = msg.sender;
        roles[msg.sender] = Role.ADMIN_BPN;
    }

    // ================================
    // INTERNAL HISTORY
    // ================================
    function _addHistory(
        string memory certNumber,
        string memory action,
        string memory owner,
        string memory nik
    ) internal {
        histories[certNumber].push(
            History(action, msg.sender, owner, nik, block.timestamp)
        );
    }

    // ================================
    // REGISTER
    // ================================
    function registerSHM(
        string memory certNumber,
        string memory cid,
        bytes32 documentHash,
        string memory ownerName,
        string memory ownerNIK
    ) public onlyAdmin {
        require(shms[certNumber].createdAt == 0, "Already registered");

        shms[certNumber] = SHM(
            certNumber,
            cid,
            documentHash,
            ownerName,
            ownerNIK,
            false,
            false,
            block.timestamp
        );

        _addHistory(certNumber, "REGISTER", ownerName, ownerNIK);
    }

    // ================================
    // VERIFY
    // ================================
    function verifySHM(string memory certNumber) public onlyAdmin {
        SHM storage s = shms[certNumber];
        require(s.createdAt != 0, "Not found");
        require(!s.revoked, "SHM revoked");

        s.verified = true;
        _addHistory(certNumber, "VERIFY", s.ownerName, s.ownerNIK);
    }

    // ================================
    // REVOKE
    // ================================
    function revokeSHM(string memory certNumber) public onlyAdmin {
        SHM storage s = shms[certNumber];
        require(s.createdAt != 0, "Not found");
        require(!s.revoked, "Already revoked");

        s.revoked = true;
        _addHistory(certNumber, "REVOKE", s.ownerName, s.ownerNIK);
    }

    // ================================
    // UPDATE OWNER
    // ================================
    function updateOwner(
        string memory certNumber,
        string memory newOwner,
        string memory newNIK
    ) public onlyAdmin {
        SHM storage s = shms[certNumber];
        require(s.createdAt != 0, "Not found");
        require(!s.revoked, "SHM revoked");

        s.ownerName = newOwner;
        s.ownerNIK = newNIK;

        _addHistory(certNumber, "UPDATE_OWNER", newOwner, newNIK);
    }

    // ================================
    // READ SHM (TIDAK REVERT)
    // ================================
    function getSHM(string memory cert)
        public
        view
        returns (
            string memory,
            string memory,
            bytes32,
            string memory,
            string memory,
            bool,
            bool
        )
    {
        SHM memory s = shms[cert];

        // ❗ TIDAK REVERT, BIAR FRONTEND AMAN
        if (bytes(s.certNumber).length == 0) {
            return ("", "", bytes32(0), "", "", false, false);
        }

        return (
            s.certNumber,
            s.cid,
            s.documentHash,
            s.ownerName,
            s.ownerNIK,
            s.verified,
            s.revoked
        );
    }

    // ================================
    // READ HISTORY
    // ================================
    function getHistory(string memory certNumber)
        public
        view
        returns (
            string[] memory actions,
            address[] memory actors,
            string[] memory owners,
            string[] memory niks,
            uint256[] memory timestamps
        )
    {
        History[] memory h = histories[certNumber];

        actions = new string[](h.length);
        actors = new address[](h.length);
        owners = new string[](h.length);
        niks = new string[](h.length);
        timestamps = new uint256[](h.length);

        for (uint i = 0; i < h.length; i++) {
            actions[i] = h[i].action;
            actors[i] = h[i].actor;
            owners[i] = h[i].owner;
            niks[i] = h[i].nik;
            timestamps[i] = h[i].timestamp;
        }
    }

    // ================================
    // SET ROLE
    // ================================
    function setRole(address user, Role role) public onlyAdmin {
        roles[user] = role;
    }
}
