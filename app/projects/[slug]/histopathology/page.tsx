"use client"
import { motion } from 'framer-motion';
import Head from 'next/head';

export default function Maintenance() {
  return (
    <>
      <Head>
        <title>We'll be back soon!</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 text-gray-800">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h1
            className="text-5xl font-bold mb-6"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            We're Under Maintenance
          </motion.h1>
          <motion.p
            className="text-xl mb-4"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Our website is currently undergoing scheduled maintenance.
          </motion.p>
          <motion.p
            className="text-lg"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            We’ll be back shortly. Thanks for your patience!
          </motion.p>
        </motion.div>
        <motion.div
          className="mt-10"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.img
            src="/industrial-robot-factory-svgrepo-com.svg" // Cambia esto por una imagen divertida o un SVG que represente mantenimiento
            alt="Under Maintenance"
            className="w-64 h-64 mx-auto"
            initial={{ rotate: -10 }}
            animate={{ rotate: 10 }}
            transition={{
              yoyo: Infinity,
              ease: "easeInOut",
              duration: 1,
            }}
          />
        </motion.div>
        <motion.div
          className="mt-10"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <a
            href="/"
            className="text-gray-800 bg-gray-200 hover:bg-gray-300 font-bold py-2 px-4 rounded"
          >
            Return to Homepage
          </a>
        </motion.div>
      </div>
    </>
  );
}
