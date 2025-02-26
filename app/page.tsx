import Layout from "./layout";
import '../styles/globals.css';
import ButtonWithArrow from "@/components/ButtonWithArrow";

export default function Home() {
  return (
    <Layout>
      <section className="flex flex-col items-center justify-center min-h-screen px-6 bg-white">
        <h1 className="text-4xl font-bold text-blue-900 text-center mt-12 mb-16">
          Selamat Datang di PantauTular!
        </h1>

        <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center gap-8 mb-16">
          <div className="flex-1 flex justify-center">
           <img src="/home.jpeg" alt="PantauTular_home" className="w-full max-w-md h-auto" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="heading-primary">
              Platform informasi sebaran penyakit menular di Indonesia?
            </h2>
            <p className="paragraph-primary">
              
              Bekerja sama dengan Badan Riset dan Inovasi Nasional (BRIN),
              <strong className="italic"> PantauTular</strong> berkomitmen untuk menyajikan data yang akurat dan 
              terkini tentang kondisi kesehatan masyarakat sehingga 
              memungkinkan pengguna untuk memantau dan mengantisipasi 
              penyebaran penyakit menular dengan lebih efektif.
            </p>
            <button className="button-primary">
              Gunakan Sekarang!
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center gap-8 mb-20">
          <div className="flex-1 text-center md:text-right">
            <h2 className="heading-primary">
              Tentang Kami
            </h2>
            <p className="paragraph-primary">
              Kenali <strong className="italic"> PantauTular</strong> dengan mengetahui latar belakang
              mewujudkan pemantauan serta pencegahan berdasarkan kondisi penyakit menular di wilayah Indonesia, yuk!
            </p>
            <div className="mt-4 flex justify-end">
              <ButtonWithArrow>Lihat Sekarang</ButtonWithArrow>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <img src="/latar_belakang.jpeg" alt="PantauTular_latarbelakang" className="w-full max-w-md h-auto" />
          </div>
        </div>

        <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center gap-8 mb-20">
          <div className="flex-1 flex justify-center">
            <img src="/tentang_kami.jpeg" alt="PantauTular_tentangkami" className="w-full max-w-md h-auto" />
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="heading-primary">
              Bantuan
            </h2>
            <p className="paragraph-primary">
              Masih terkendala seputar <strong className="italic"> PantauTular</strong>? Ketahui penggunaan
              <strong className="italic"> PantauTular</strong> untuk memperoleh berbagai informasi terkait penyakit
              menular berdasarkan nama penyakit, lokasi, sumber berita, tanggal 
              kejadian, tingkat kewaspaan, dan masih banyak lagi!
            </p>
            <ButtonWithArrow>Baca Selengkapnya</ButtonWithArrow>
          </div>
        </div>
      </section>
    </Layout>
  );
}
