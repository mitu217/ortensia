const fs = require('fs');

const proxyquire = require('proxyquire');
const httpMocks  = require('node-mocks-http');
const sinon      = require('sinon');
const chai       = require('chai');
const sinonChai = require('sinon-chai');

describe('Firebase Functions', () => {
    let haruka, sandbox, expect;

    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth()+1;

    before(() => {
        haruka  = proxyquire('../lib/haruka', {});
        sandbox = sinon.createSandbox();
        expect  = chai.use(sinonChai).expect;
    });

    after(() => {
        path = haruka.getPath(year, month);
        fs.unlinkSync(path);
    });

    beforeEach(() => {
        sandbox.restore();
    })

    describe('scraping', () => {
        it ('should response 200', async () => {
            var request  = httpMocks.createRequest({
                method: 'GET',
                params: { year: year, month: month },
            });
            var response = httpMocks.createResponse();
            await haruka.fetchAction(request, response);
            expect(response.statusCode).to.equal(200);
        })
    });
});