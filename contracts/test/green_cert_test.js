const GreenCert = artifacts.require("./GreenCert.sol");

class cert {
    constructor(contract, accounts, max) {
        let genId = Math.floor(Math.random() * Math.floor(max));
        this.generator = accounts[genId];
        this.contract = contract;
        this.approved = false;
    }

    async addRec(begin, end) {
        let res = await this.contract.addRecord(begin, end, {from: this.generator});
        this.certNum = res.logs[0].args.number.toNumber();
        return this.generator === res.logs[0].args.generator;
    }

    async approve(vrf) {
        await this.contract.approveToGreen(this.certNum, {from: vrf});
        this.approved = true;
        this.owner = await this.contract.ownerOf(this.certNum);
        return this.owner === this.generator;
    }

    async transfer(to) {
        await this.contract.transferFrom(this.owner, to, this.certNum, {from: this.owner});
        this.owner = await this.contract.ownerOf(this.certNum);
        return this.owner === to;
    }

    async ownerOk() {
        return this.owner === await this.contract.ownerOf(this.certNum);
    }
}

const certCount = 50;

function randBool() {
    return Math.floor(Math.random() * Math.floor(2)) == 0;
}

contract('Green certificates issuing and circulation test', (accounts) => {
    let contract, gen1, gen2, vrf;
    let certs = [];

    before(async () => {
        contract = await GreenCert.deployed();
        gen1 = accounts[1];
        gen2 = accounts[2];
        gen3 = accounts[3];
        vrf  = accounts[4];
    });

    it('Set generators and verificator', async () => {
        await contract.addGenerator(gen1, "generator_1");
        await contract.addGenerator(gen2, "generator_2");
        await contract.addGenerator(gen3, "generator_3");
        await contract.addVerificator(vrf, "verificator");
    });

    it('Check is owner minter (for ERC721)', async () => {
        assert.ok(await contract.isMinter(accounts[0]));
    });

    it('Check is verificator minter (for ERC721)', async () => {
        assert.ok(await contract.isMinter(vrf));
    });

    it('Adding records to ledger', async () => {
        for (let i = 0; i < certCount; i++) {
             let crt = new cert(contract, accounts.slice(1,4), 3);
             assert.ok(await crt.addRec(1,2));
             certs.push(crt);
        }
    });

    it('Approving random certificates', async () => {
        for (let i = 0; i < certCount; i++) {
            if (randBool()) continue;
            assert.ok(await certs[i].approve(vrf));
        }
    });

    it('Random transferring', async () => {
        for (let j = 0; j < 50; j++) {
            for (let i = 0; i < certCount; i++) {
                 if (!certs[i].approved) continue;
                 if (randBool()) continue;
                 let toId = Math.floor(Math.random() * Math.floor(5));
                 let to = accounts[5 + toId];
                 if (!to) continue;
                 if (to === certs[i].owner) continue;
                 assert.ok(await certs[i].transfer(to));
            }
        }
    });

    it('Check owners', async () => {
        for (let i = 0; i < certCount; i++) {
            if (!certs[i].approved) continue;
            if (certs[i].generator === certs[i].owner) {
                assert.ok(await certs[i].transfer(accounts[5]));
                assert.notEqual(certs[i].generator, certs[i].owner);
            }
            assert.ok(await certs[i].ownerOk());
        }
    });
});
