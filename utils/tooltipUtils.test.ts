import { getTooltipHTML, TooltipData } from "./tooltipUtils";

describe("getTooltipHTML", () => {
  it("should generate the correct HTML for the tooltip", () => {
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

    // Check if the result contains the expected data
    expect(result).toContain(tooltipData.id);
    expect(result).toContain(tooltipData.location);
    expect(result).toContain(tooltipData.summary);
    expect(result).toContain(tooltipData.gender);
    expect(result).toContain(tooltipData.age);
    expect(result).toContain(tooltipData.alertLevel);
    expect(result).toContain(tooltipData.relatedSearch);
    expect(result).toContain(tooltipData.source);

    // Check if the result contains the expected HTML structure
    expect(result).toContain('<div class="tooltip-container">');
    expect(result).toContain('<h1>Detail Kasus Penyakit Menular</h1>');
    expect(result).toContain('<span class="label">ID Kasus:</span>');
    expect(result).toContain('<span class="label">Lokasi:</span>');
  });
  it("should handle missing or null values gracefully", () => {
    const tooltipData = {
      id: "", // Missing or null value
      location: "", // Empty string
      summary: "", // Undefined value
      gender: "Pria",
      age: "Tidak diketahui",
      alertLevel: "Wespoda",
      relatedSearch: "Apa itu Cacar Moriyet?",
      source: "(1/2) 09Nov2023 Sudah 4 Warga Jabar Positif Cacar Moriyet (detik.com)",
    };

    const result = getTooltipHTML(tooltipData);

    // Check if the result handles missing/null values
    expect(result).toContain(`<span class="value"></span>`); // Empty value for id
    expect(result).toContain(`<span class="value"></span>`); // Empty value for location
    expect(result).toContain(`<span class="value"></span>`); // Empty value for summary
    expect(result).toContain(`<span class="value">${tooltipData.gender}</span>`); // Valid value
  });
  it("should handle extremely long strings and special characters", () => {
    const tooltipData = {
      id: "NP00IP05K100B",
      location: "Kota Bekasi, Jawa Barat with a very long location name that exceeds normal limits",
      summary: "Pemerintah Kota Bekasi melalui Dinas Kesehatan Kota Bekasi mengkonfirmasi kasus Cacar Moriyet sebanyak 8 kasus suspek diantaranya 1 orang positif sedang menjalani isolasi RS. This is a very long summary that might break the layout.",
      gender: "Pria",
      age: "Tidak diketahui",
      alertLevel: "Wespoda with special characters: !@#$%^&*()",
      relatedSearch: "Apa itu Cacar Moriyet?",
      source: "(1/2) 09Nov2023 Sudah 4 Warga Jabar Positif Cacar Moriyet (detik.com)",
    };

    const result = getTooltipHTML(tooltipData);

    // Check if the result contains the long strings and special characters
    expect(result).toContain(`<span class="value">${tooltipData.location}</span>`);
    expect(result).toContain(`<span class="value">${tooltipData.summary}</span>`);
    expect(result).toContain(`<span class="value">${tooltipData.alertLevel}</span>`);
  });
});