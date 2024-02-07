import React from 'react';
import ReactLoading, { LoadingType } from 'react-loading';
 
const Loading = ({ type, color }: { type: LoadingType | undefined, color: string }) => (
   <div className='w-full flex text-center items-center justify-center h-96'>
       <ReactLoading type={type} color={color} width={175} />
   </div> 
);
 
export default Loading;