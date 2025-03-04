import Image from "next/image";

export default function MapGallery() {
  return (
    <section className="flex flex-col items-center justify-center p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Image 
          src="/peta_persebaran.png" 
          alt="Peta Sebaran 1" 
          width={400} 
          height={200} 
          className="rounded-lg shadow-2xl transition-transform transform hover:scale-105"
        />
        <Image 
          src="/peta_tematik.png" 
          alt="Peta Sebaran 2" 
          width={400} 
          height={200} 
          className="rounded-lg shadow-2xl transition-transform transform hover:scale-105"
        />
        <Image 
          src="/peta_timestamp.png" 
          alt="Peta Sebaran 3" 
          width={400} 
          height={200} 
          className="rounded-lg shadow-2xl transition-transform transform hover:scale-105"
        />
      </div>
    </section>
  );
}
