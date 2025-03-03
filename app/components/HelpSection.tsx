import ButtonWithArrow from "@/components/ButtonWithArrow";
import Image from "next/image";

export default function HelpSection() {
  return (
    <section className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center gap-8 mb-20">
      <div className="flex-1 flex justify-center">
        <Image src="/tentang_kami.jpeg" alt="PantauTular_tentangkami" width={400} height={300} />
      </div>

      <div className="flex-1 text-center md:text-left">
        <h2 className="heading-primary">Bantuan</h2>
        <p className="paragraph-primary">
        Masih terkendala seputar <strong className="italic"> PantauTular </strong>? Ketahui penggunaan
        <strong className="italic"> PantauTular </strong> untuk memperoleh berbagai informasi terkait penyakit
        menular berdasarkan nama penyakit, lokasi, sumber berita, tanggal 
        kejadian, tingkat kewaspaan, dan masih banyak lagi!
        </p>
        <div className="mt-4 flex justify-start">
        <ButtonWithArrow href="/help">Baca Selengkapnya</ButtonWithArrow>
        </div>
        
      </div>
    </section>
  );
}
