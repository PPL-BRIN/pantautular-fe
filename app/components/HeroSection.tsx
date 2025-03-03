import Image from "next/image";
import ButtonBase from "@/components/ButtonBase";

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-6 bg-white">
      <h1 className="text-4xl font-bold text-blue-900 text-center mt-12 mb-32">
        Selamat Datang di PantauTular!
      </h1>

      <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center gap-8 mb-16">
        <div className="flex-1 flex justify-center">
          <Image src="/home.jpeg" alt="PantauTular_home" width={400} height={300} />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h2 className="heading-primary">
            Platform informasi sebaran penyakit menular di Indonesia?
          </h2>
          <p className="paragraph-primary">
            Bekerja sama dengan Badan Riset dan Inovasi Nasional (BRIN), <strong className="italic">PantauTular</strong> berkomitmen untuk menyajikan data yang akurat dan 
            terkini tentang kondisi kesehatan masyarakat sehingga 
            memungkinkan pengguna untuk memantau dan mengantisipasi 
            penyebaran penyakit menular dengan lebih efektif.
          </p>
          <ButtonBase href="/">Gunakan Sekarang!</ButtonBase>
        </div>
      </div>
    </section>
  );
}
