const assert = require('assert');
const HTMLHandler = require('../index');

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason);
});

const TEST_ADDRESS = {
  server : 'srv-webdev',
  port : 1080,
  suffix : 'wstest/'
}
//'http://srv-webdev:1080/wstest/';
let html = null;

describe('Test HTMLHandler node', () => {
  before(async() => {
    process.env.debug = true;
    html = new HTMLHandler();
    html.init(TEST_ADDRESS);
  });

  it('Test GET', async () => {
    html.GET('200').then((retour) => {
      assert(retour.body == "200" && retour.code == 200);
    }).catch((err, code) => {
      console.log('err ' + err);
    });

    html.GET('500').then((retour) => {
      console.log('normalement, on ne passe pas ici');
      assert(false);
    }).catch((err) => {
      assert(err.code == 500);
    });

  });

  it('Test POST', () => {
    html.POST('200', "hop").then((retour) => {
      assert(retour.code == 200);
    });
  });

  it('Test PUT', () => {
    html.PUT('200', "hop").then((retour) => {
      assert(retour.code == 200);
    });
  });

  it('Test DELETE', () => {
    html.DELETE('200').then((retour) => {
      assert(retour.code == 200);
    });
  });

  it('Test callback' , () => {
    html.GET('200', (ret) => {
      assert(ret != undefined);
      assert(ret.code == 200);
    })
  })
})
