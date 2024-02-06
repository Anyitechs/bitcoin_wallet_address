const expect = require('chai').expect;
const { getTxVersion, getRawtx, getTxLocktime, 
    getTxOutputs, getTxInputs } = require('../src/index');


describe("Transaction components tests", () => {
    const txUrl = "https://mempool.space/api/tx/6d9da35544e87a88279c5bfc66e08a873f3d456b4d6112620e2c41555863f920/hex";

    describe("Get raw transaction hex", async () => {
        it('should get the raw transaction hex and return it', async () => {
            const txHex = await getRawtx(txUrl);
            expect(txHex).to.not.be.null;
        });
    });

    describe("Get transaction version", async () => {
        it("should get the version of the trasnaction", async () => {
            const txVersion = await getTxVersion(txUrl);
            expect(txVersion).to.satisfy((versionNumber) => {
                if (versionNumber === 1 || versionNumber === 2) {
                    return true;
                }
                return false;
            });
        });
    });

    describe("Get transaction locktime", async () => {
        it("should get the locktime of the given transaction", async () => {
            const txLocktime = await getTxLocktime(txUrl);
            expect(txLocktime).to.be.greaterThanOrEqual(0);
        });
    });

    describe("Get transaction outputs", async () => {
        it("should get the outputs of the given transaction", async () => {
            const txOutput = await getTxOutputs(txUrl);
            expect(txOutput[0]).to.haveOwnProperty("scriptPubKey");
        });
    });

    describe("Get transaction inputs", async () => {
        it("should get the input/inputs of the given transaction", async () => {
            const txInput = await getTxInputs(txUrl);
            expect(txInput).to.satisfy((input) => {
                for (let i = 0; i < input.length; i++) {
                    if (input[i].txid === '' || input[i].txid === null) {
                        return false;
                    }
                    return true;
                }
            });
        });
    })
})

