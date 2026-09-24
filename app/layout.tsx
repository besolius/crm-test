import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'CRM Forever · Spațiul tău de lucru',description:'Contactele, conversațiile și acțiunile tale Business și Produse, într-un singur loc.',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ro" className="dark"><body>{children}</body></html>}
