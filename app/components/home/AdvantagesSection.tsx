export default function AdvantagesSection() {
    return (
      <section className="relative w-full h-auto">
        <div className="bg-gradient-to-br from-green-100/30 to-transparent w-full h-1/2 absolute top-0 left-0 z-0"></div> 
  
        <div className="relative w-full h-auto grid grid-cols-1 md:grid-cols-3 gap-4 p-6 z-10 max-w-7xl mx-auto">
        {[
          {
            id: "akses-mudah",
            title: "Akses Mudah dan Cepat",
            text: "Akses serbaguna baik bagi masyarakat umum maupun profesional kesehatan dalam memperoleh informasi yang dibutuhkan dengan cepat.",
          },
          {
            id: "data-akurat",
            title: "Data Akurat dan Terkini",
            text: "Menyajikan data aktual yang dapat diandalkan untuk membantu proses pengambilan tindakan pencegahan yang tepat terhadap penyakit menular.",
          },
          {
            id: "pemantauan-efektif",
            title: "Pemantauan Efektif",
            text: "Menyediakan beragam fitur dan peta interaktif yang memungkinkan pengguna mengetahui kondisi di wilayah Indonesia secara lebih mendalam.",
          },
        ].map((feature) => (
          <div key={feature.id} className="text-left mx-auto w-3/4 md:w-[350px]">
            <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-700 text-justify text-base">
              <em>{feature.text}</em>
            </p>
          </div>
        ))}

        </div>
      </section>
    );
  }
  