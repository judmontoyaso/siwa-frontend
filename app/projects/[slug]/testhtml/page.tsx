"use client"
    
import { useEffect,useState } from 'react';


export default function Page({ params }: { params: { slug: string } }) {

    const [htmlContent, setHtmlContent] = useState('');


    useEffect(() => {
        fetch('/api/components/innerHtml')
        .then((res) => res.json())
          .then((data) => {
            console.log('HTML content:', data.content); // Verificar si se recibe el contenido correctamente
            setHtmlContent(data.content);
          });
      }, []);

 

console.log(htmlContent);
    return (
        <div
        dangerouslySetInnerHTML={{__html: htmlContent}}
      />
    );
}

