const path = require('path');
module.exports = {
    images: {
      domains: ['siwaflask-env.eba-zp48iscj.us-east-2.elasticbeanstalk.com', "siwareports.s3.amazonaws.com"],
    },
    sassOptions: {
      includePaths: [path.join(__dirname, 'styles')],
    },
  }
  