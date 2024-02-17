"use client";
import { useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import Beta from "@/components/beta";


import React from 'react';

const page = ({ params }: { params: { slug: string } }) => {
  return (
    <div>
      <Beta params={params}>

     

      </Beta>
    </div>
  );
};

export default page;