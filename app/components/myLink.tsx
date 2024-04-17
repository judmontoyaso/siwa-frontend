

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

import { useEffect } from "react";

export default function MyLink({ href, children, prefetch, className }: {className:any, href: any,children:any, prefetch: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const style = {
    marginRight: 10,
    color: pathname === href ? "red" : "black"
  };

  useEffect(() => {
    console.log(href+ " prefetch is: "+ prefetch);
    if (prefetch) router.prefetch(href);
  });

  const handleClick = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    console.log("Having fun with Next.js.");
    router.push(href);
  };

  return (
    <a 
      style = {{ margin: 10 }}
      href={href} 
      className={className}
      onClick={handleClick}
      >
      {children}
    </a>
  );
}