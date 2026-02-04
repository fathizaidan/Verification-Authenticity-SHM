// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SHMRegistry {

    struct SHM {
        string certNumber;
        string cid;          // IPFS CID
        bytes32 documentHash;

        string ownerName;
        string ownerNIK;

        bool verified;
        bool revoked;
        uint256 createdAt;
    }

    mapping(string => SHM) private shms;

    // ========= EVENTS =========

    event SHMRegistered(
        string certNumber,
        bytes32 documentHash,
        string cid
    );

    event SHMVerified(string certNumber);
    event SHMRevoked(string certNumber);

    event OwnerUpdated(
        string certNumber,
        string oldOwner,
        string newOwner
    );

    // ========= REGISTER =========

    function registerSHM(
        string memory certNumber,
        string memory cid,
        bytes32 documentHash,
        string memory ownerName,
        string memory ownerNIK
    ) public {

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

        emit SHMRegistered(certNumber, documentHash, cid);
    }

    // ========= VERIFY =========

    function verifySHM(string memory certNumber) public {
        require(shms[certNumber].createdAt != 0, "Not found");
        shms[certNumber].verified = true;

        emit SHMVerified(certNumber);
    }

    // ========= REVOKE =========

    function revokeSHM(string memory certNumber) public {
        require(shms[certNumber].createdAt != 0, "Not found");
        shms[certNumber].revoked = true;

        emit SHMRevoked(certNumber);
    }

    // ========= UPDATE OWNER =========

    function updateOwner(
        string memory certNumber,
        string memory newOwner,
        string memory newNIK
    ) public {

        string memory oldOwner = shms[certNumber].ownerName;

        shms[certNumber].ownerName = newOwner;
        shms[certNumber].ownerNIK = newNIK;

        emit OwnerUpdated(certNumber, oldOwner, newOwner);
    }

    // ========= READ =========

    function getSHM(string memory certNumber)
        public
        view
        returns (
            string memory,
            string memory,
            bytes32,
            string memory,
            string memory,
            bool,
            bool,
            uint256
        )
    {
        SHM memory s = shms[certNumber];

        return (
            s.certNumber,
            s.cid,
            s.documentHash,
            s.ownerName,
            s.ownerNIK,
            s.verified,
            s.revoked,
            s.createdAt
        );
    }
}
