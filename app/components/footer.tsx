import Image from 'next/image';

const Footer = () => {
  // URL de las imágenes para los logos
  const logoUrl = '/Siwa-blanco-01.png';  // Ajusta al logo central
  const rightLogoUrl = 'https://siwa.bio/wp-content/uploads/2021/02/logo-member-of.png';  // Ajusta al logo derecho

  // URL para la imagen de fondo
  const backgroundImageUrl = 'https://siwa.bio/wp-content/uploads/2021/02/footer_Mesa-de-trabajo-1.png';  // Ajusta esta URL

  return (
    <div 
      className="flex justify-between items-center p-4 w-full text-white"
      style={{ backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: 'cover' }}
    >
      <div className="ml-4 w-1/3 text-start">
        <h3  className="text-2xl font-bold mb-2">Contact Us</h3>
        <div>
            <p className='text-base mb-1'>siwa@iluma.bio</p>
            <p className='text-base mb-1'>1307 Person St
Durham, NC 27703, USA</p>
<p className='text-base mb-1'>Phone: +1 919 321 2199</p>
        </div>
      </div>
      <div className="flex justify-center items-center w-1/3">
        <Image src={logoUrl} alt="Logo" width={200} height={100} />
      </div>
      <div className="mr-4 w-1/3 flex justify-end">
        <Image src={rightLogoUrl} alt="Right Logo" width={200} height={100} />
      </div>
    </div>
  );
};

export default Footer;
