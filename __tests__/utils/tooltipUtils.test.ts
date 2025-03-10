import { getTooltipHTML, TooltipData } from "../../utils/tooltipUtils";

describe("getTooltipHTML", () => {
  it("should include all tooltip data in the generated HTML", () => {
    const tooltipData: TooltipData = {
      id: "NP00IP05K100B",
      location: "Kota Bekasi, Jawa Barat",
      summary: "Pemerintah Kota Bekasi melalui Dinas Kesehatan Kota Bekasi mengkonfirmasi kasus Cacar Monyet sebanyak 8 kasus suspek diantaranya 1 orang positif sedang menjalani isolasi RS.",
      gender: "Pria",
      age: "Tidak diketahui",
      alertLevel: "Waspada",
      relatedSearch: "Apa itu Cacar Monyet",
      source: "(1/2) 09 Nov 2023 Sudah ada 4 Warga Jabar Positif Cacar Monyet (detik.com)",
    };

    const result = getTooltipHTML(tooltipData);

    // Test if all data is present in the HTML, regardless of structure
    Object.values(tooltipData).forEach(value => {
      expect(result).toContain(value);
    });

    // Test essential structural elements
    expect(result).toContain("<div");
    expect(result).toContain("</div>");
    expect(result).toContain("Detail Kasus Penyakit Menular");
  });

  it("should handle empty or null values appropriately", () => {
    const tooltipData: TooltipData = {
      id: "",
      location: "",
      summary: "",
      gender: "Pria",
      age: "",
      alertLevel: "",
      relatedSearch: "",
      source: "",
    };

    const result = getTooltipHTML(tooltipData);

    // Verify HTML is generated without errors
    expect(result).toBeTruthy();
    expect(result).toContain("<div");
    expect(result).toContain("</div>");
    expect(result).toContain("Pria"); // Only non-empty value
  });

  it("should handle special characters and long text", () => {
    const tooltipData: TooltipData = {
      id: "ID-123!@#$%^&*()",
      location: "Kota Bekasi, Jawa Barat ".repeat(10), // Long location name
      summary: "Ringkasan panjang mengenai kasus penyakit menular ".repeat(5),
      gender: "Lainnya",
      age: "20-30 tahun",
      alertLevel: "Tinggi & Kritis",
      relatedSearch: "Gejala + Penanganan & Pencegahan",
      source: "Dinas Kesehatan (2024) & WHO Report"
    };

    const result = getTooltipHTML(tooltipData);

    // Verify all content is present
    Object.values(tooltipData).forEach(value => {
      expect(result).toContain(value);
    });

    // Verify the tooltip still renders with proper structure
    expect(result).toContain("<div");
    expect(result).toContain("</div>");
    expect(result).toContain("Detail Kasus Penyakit Menular");
  });
});