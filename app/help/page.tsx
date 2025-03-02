import HelpImage from "./components/HelpImage";
import HelpTitle from "./components/HelpTitle";
import HelpSection from "./components/HelpSection";
import BackgroundCircle from "./components/BackgroundCircle";
import HelpFinalSection from "./components/HelpFinalSection";

export default function BantuanPantauTular() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <HelpTitle />

        <div className="mt-10 md:mt-12">
          <HelpSection
            title="1. Pencarian Berdasarkan Nama Penyakit"
            description={`Pengguna dapat memasukkan nama penyakit yang ingin dicari di kotak
            pencarian. Hasil akan menampilkan semua informasi terkait penyakit
            tersebut, termasuk lokasi, tanggal kejadian, dan sumber berita
            terbaru.`}
            imageSrc="/help/pt-3.png"
            imageAlt="Pencarian berdasarkan penyakit"           
          />
        </div>

        <div className="mt-10 md:mt-16">
          <HelpSection
            title="2. Pencarian Berdasarkan Lokasi"
            description={`Untuk mencari informasi berdasarkan lokasi, pengguna dapat memilih wilayah
            atau masukkan nama tempat tertentu. Hasil pencarian akan menampilkan penyakit 
            yang terdeteksi di lokasi tersebut beserta detail lainnya.`}
            imageSrc="/help/pt-4.png"
            imageAlt="Pencarian berdasarkan lokasi"
          />
        </div>

        <div className="mt-10 md:mt-16">
          <HelpSection
            title="3. Pencarian Berdasarkan Sumber Berita"
            description={`Pengguna dapat memilih untuk mencari berdasarkan sumber berita tertentu, 
            seperti situs berita atau lembaga kesehatan. Hasil pencarian akan menampilkan 
            informasi penyakit yang terkait dengan sumber berita yang dipilih.`}
            imageSrc="/help/pt-5.png"
            imageAlt="Pencarian berdasarkan sumber berita"
          />
        </div>

        <div className="mt-10 md:mt-16">
          <HelpSection
            title="4. Pencarian Berdasarkan Tingkat Kewaspadaan"
            description={`Pengguna dapat memilih tingkat kewaspadaan berdasarkan bintang yang 
            menggambarkan urutan potensi tertular. Hasil pencarian akan menampilkan
            penyakit dengan tingkat kewaspadaan sesuai dengan pilihan pengguna.`}
            imageSrc="/help/pt-6.png"
            imageAlt="Pencarian berdasarkan tanggal"
          />
        </div>

        <div className="mt-10 md:mt-16">
          <HelpSection
            title="5. Pencarian Berdasarkan Tanggal Kejadian"
            description={`Untuk melihat informasi terkini atau masa lalu, pengguna dapat memilih 
            rentang tanggal kejadian tertentu. Platform akan menampilkan penyakit yang
            terdeteksi dalam rentang waktu tersebut.`}
            imageSrc="/help/pt-7.png"
            imageAlt="Pencarian berdasarkan kewaspadaan"
          />
        </div>

        <HelpFinalSection />
      </div>
    </div>
  );
}