"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function NavLink({ to, children }: { to: string, children: React.ReactNode }) {
    const router = usePathname();
    const isActive = router === to;

    return (
        <Link href={to}>
            <span style={{ color: isActive ? 'red' : 'black' }}>
                {children}
            </span>
        </Link>
    );
}

