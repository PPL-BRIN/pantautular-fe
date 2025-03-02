import Image from "next/image";
import ImageHelp from "./components/ImageHelp";

export default function BantuanPantauTular() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 md:px-10">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-lg">

        <h1 className="text-3xl font-bold text-center text-blue-900 mb-4">
          Bantuan PantauTular
        </h1>

        <p className="text-gray-600 text-center italic">
          <span className="font-semibold">PantauTular</span> sebagai platform
          yang memungkinkan pengguna untuk melacak sebaran penyakit menular di
          wilayah Indonesia{" "}
          <span className="font-semibold">menyediakan informasi</span> terkait
          penyakit menular berdasarkan berbagai kriteria, seperti{" "}
          <span className="italic font-medium">
            Nama Penyakit, Lokasi, Sumber Berita, Tanggal Kejadian
          </span>
          , dan{" "}
          <span className="italic font-medium">Tingkat Kewaspadaan</span>.
        </p>

        {/* Section 1 */}
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-blue-900">
                1. Pencarian Berdasarkan Nama Penyakit
            </h2>
            <p className="text-gray-700 mt-2">
                Pengguna dapat memasukkan nama penyakit yang ingin dicari di kotak
                pencarian. Hasil akan menampilkan semua informasi terkait penyakit
                tersebut, termasuk lokasi, tanggal kejadian, dan sumber berita
                terbaru.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <ImageHelp src="/help/pt-1.png" alt="Peta umum" />
                <ImageHelp src="/help/pt-2.png" alt="Detail kasus" />
                <ImageHelp src="/help/pt-3.png" alt="Pencarian berdasarkan penyakit" />
            </div>
        </div>

        {/* Section 2 */}
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-blue-900">
                2. Pencarian Berdasarkan Lokasi
            </h2>
            <p className="text-gray-700 mt-2">
            Untuk mencari informasi berdasarkan lokasi, pengguna dapat memilih wilayah
            atau masukkan nama tempat tertentu. Hasil pencarian akan menampilkan penyakit 
            yang terdeteksi di lokasi tersebut beserta detail lainnya.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <ImageHelp src="/help/pt-1.png" alt="Peta umum" />
                <ImageHelp src="/help/pt-2.png" alt="Detail kasus" />
                <ImageHelp src="/help/pt-4.png" alt="Pencarian berdasarkan lokasi" />
            </div>
        </div>

        {/* Section 3 */}
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-blue-900">
                3. Pencarian Berdasarkan Sumber Berita
            </h2>
            <p className="text-gray-700 mt-2">
            Pengguna dapat memilih untuk mencari berdasarkan sumber berita tertentu, 
            seperti situs berita atau lembaga kesehatan. Hasil pencarian akan menampilkan 
            informasi penyakit yang terkait dengan sumber berita yang dipilih.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <ImageHelp src="/help/pt-1.png" alt="Peta umum" />
                <ImageHelp src="/help/pt-2.png" alt="Detail kasus" />
                <ImageHelp src="/help/pt-5.png" alt="Pencarian berdasarkan sumber berita" />
            </div>
        </div>

        {/* Section 4 */}
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-blue-900">
                4. Pencarian Berdasarkan Tingkat Kewaspadaan
            </h2>
            <p className="text-gray-700 mt-2">
            Pengguna dapat memilih tingkat kewaspadaan berdasarkan bintang yang 
            menggambarkan urutan potensi tertular. Hasil pencarian akan menampilkan 
            penyakit dengan tingkat kewaspadaan sesuai dengan pilihan pengguna.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <ImageHelp src="/help/pt-1.png" alt="Peta umum" />
                <ImageHelp src="/help/pt-2.png" alt="Detail kasus" />
                <ImageHelp src="/help/pt-6.png" alt="Pencarian berdasarkan tanggal" />
            </div>
        </div>

        {/* Section 5 */}
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-blue-900">
                5. Pencarian Berdasarkan Tanggal Kejadian
            </h2>
            <p className="text-gray-700 mt-2">
            Untuk melihat informasi terkini atau masa lalu, pengguna dapat memilih 
            rentang tanggal kejadian tertentu. Platform akan menampilkan penyakit yang 
            terdeteksi dalam rentang waktu tersebut.
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <ImageHelp src="/help/pt-1.png" alt="Peta umum" />
                <ImageHelp src="/help/pt-2.png" alt="Detail kasus" />
                <ImageHelp src="/help/pt-7.png" alt="Pencarian berdasarkan kewaspadaan" />
            </div>
        </div>

        <div className="bg-blue-50 mt-4 py-12 px-6 text-center rounded-lg relative z-10">
            <h2 className="text-xl font-semibold text-gray-900">Setelah melakukan pencarian,</h2>
            <p className="mt-2 text-gray-700 max-w-2xl mx-auto">
                Pengguna akan melihat hasil dalam bentuk peta interaktif atau 
                daftar yang mencakup informasi lengkap tentang penyakit yang dicari. 
                Pengguna juga dapat mengakses sumber berita asli untuk informasi lebih lanjut.
            </p>
            <p className="mt-4 text-gray-700 max-w-2xl mx-auto">
                <span className="font-bold">Catatan:</span> 
                Platform <i>PantauTular</i> bertujuan untuk memberikan informasi yang 
                akurat dan terkini tentang sebaran penyakit menular di Indonesia. 
                Namun, <i className="font-semibold">pengguna dihimbau untuk selalu 
                memverifikasi informasi lebih lanjut</i> dari sumber resmi sebelum 
                mengambil tindakan apa pun terkait kesehatan mereka.
            </p>
        </div>

      </div>
    </div>
  );
}
