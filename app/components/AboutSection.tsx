import ButtonWithArrow from "@/components/ButtonWithArrow";
import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center gap-8 mb-20 mt-20">
      <div className="flex-1 text-center md:text-right">
        <h2 className="heading-primary">Tentang Kami</h2>
        <p className="paragraph-primary">
          Kenali <strong className="italic"> PantauTular</strong> dengan mengetahui latar belakang
          mewujudkan pemantauan serta pencegahan berdasarkan kondisi penyakit menular di wilayah Indonesia, yuk!
        </p>
        <div className="mt-4 flex justify-end">
          <ButtonWithArrow>Lihat Sekarang</ButtonWithArrow>
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <Image src="/latar_belakang.jpeg" alt="PantauTular_latarbelakang" width={400} height={300} />
      </div>
    </section>
  );
}
