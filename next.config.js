const path = require('path');
const { webpack } = require('next/dist/compiled/webpack/webpack');
module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve('buffer/'),
      };
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );
    }
    return config;
  },
    images: {
      domains: ['siwaflask-env.eba-zp48iscj.us-east-2.elasticbeanstalk.com', "siwareports.s3.amazonaws.com"],
    },
    sassOptions: {
      includePaths: [path.join(__dirname, 'styles')],
    },

    rewrites: async () => [
      {
        source: "/public/myfile.html",
        destination: "/pages/api/myfile.js",
      },
    ],
  }

  
  