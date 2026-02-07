// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SHMRegistry {

    // ================================
    // STRUCT
    // ================================

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
    // EVENTS
    // ================================

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

    event HistoryAdded(
        string certNumber,
        string action,
        address actor,
        uint256 timestamp
    );

    // ================================
    // MODIFIER
    // ================================

modifier onlyAdmin() {
    require(
        roles[msg.sender] == Role.ADMIN_BPN,
        "Only Admin/BPN"
    );
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
        History(
            action,         // 0
            msg.sender,    // 1
            owner,         // 2
            nik,           // 3
            block.timestamp// 4
        )
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

        emit SHMRegistered(certNumber, documentHash, cid);
        _addHistory(certNumber, "REGISTER", ownerName, ownerNIK);

    }

    // ================================
    // VERIFY
    // ================================

    function verifySHM(string memory certNumber) public onlyAdmin {

        require(shms[certNumber].createdAt != 0, "Not found");
        require(!shms[certNumber].revoked, "SHM revoked");

        shms[certNumber].verified = true;

        emit SHMVerified(certNumber);
_addHistory(
    certNumber,
    "VERIFY",
    shms[certNumber].ownerName,
    shms[certNumber].ownerNIK
);


    }

    // ================================
    // REVOKE
    // ================================

    function revokeSHM(string memory certNumber) public onlyAdmin {
        require(shms[certNumber].createdAt != 0, "Not found");

        shms[certNumber].revoked = true;

        emit SHMRevoked(certNumber);
_addHistory(
    certNumber,
    "REVOKE",
    shms[certNumber].ownerName,
    shms[certNumber].ownerNIK
);



    }

    // ================================
    // UPDATE OWNER
    // ================================

    function updateOwner(
        string memory certNumber,
        string memory newOwner,
        string memory newNIK
    ) public onlyAdmin {

        require(shms[certNumber].createdAt != 0, "Not found");

        string memory oldOwner = shms[certNumber].ownerName;

        shms[certNumber].ownerName = newOwner;
        shms[certNumber].ownerNIK = newNIK;

        emit OwnerUpdated(certNumber, oldOwner, newOwner);
_addHistory(certNumber, "UPDATE_OWNER", newOwner, newNIK);


    }

    // ================================
    // READ SHM
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
        bool
    )
{
    SHM storage s = shms[cert];
    require(bytes(s.certNumber).length != 0, "SHM not found");

    return (
        s.certNumber,
        s.cid,
        s.documentHash,
        s.ownerName,
        s.ownerNIK,
        s.verified
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
