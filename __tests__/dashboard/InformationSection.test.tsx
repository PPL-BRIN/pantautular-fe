import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import InformationSection from "../../app/components/dashboard/InformationSection"; // Adjust the import path if necessary
import GeneralInformation from "../../app/components/dashboard/GeneralInformation";
import CasesOrder from "../../app/components/dashboard/CasesOrder";
import DashboardButton from "../../app/components/floating_buttons/DashboardButton";
import {MapButton} from "../../app/components/floating_buttons/MapButton";
import React from "react";

// Mock dependencies
jest.mock("../GeneralInformation", () => () => <div>Mocked General Information</div>);
jest.mock("../CasesOrder", () => () => <div>Mocked Cases Order</div>);
jest.mock("../DashboardButton", () => () => <button>Dashboard Button</button>);
jest.mock("../MapButton", () => () => <button>Map Button</button>);

describe("InformationSection Component", () => {
  it("renders correctly with the expected elements", () => {
    render(<InformationSection />);
    expect(screen.getByText("Informasi Umum")).toBeInTheDocument();
    expect(screen.getByText("Urutan Kasus")).toBeInTheDocument();
    expect(screen.getByText("Dashboard Button")).toBeInTheDocument();
    expect(screen.getByText("Map Button")).toBeInTheDocument();
    expect(screen.getByText("Mocked General Information")).toBeInTheDocument();
  });

  it("switches to CasesOrder when 'Urutan Kasus' is clicked", () => {
    render(<InformationSection />);

    fireEvent.click(screen.getByText("Urutan Kasus"));
    expect(screen.getByText("Mocked Cases Order")).toBeInTheDocument();
  });

  it("switches back to GeneralInformation when 'Informasi Umum' is clicked", () => {
    render(<InformationSection />);

    fireEvent.click(screen.getByText("Urutan Kasus"));
    fireEvent.click(screen.getByText("Informasi Umum"));

    expect(screen.getByText("Mocked General Information")).toBeInTheDocument();
  });

  it("applies the correct CSS classes", () => {
    render(<InformationSection />);

    const container = screen.getByText("Informasi Umum").parentElement?.parentElement?.parentElement;
    
    expect(container).toHaveClass("flex", "flex-col", "h-full", "bg-transparent", "text-white", "text-xl", "p-4", "pt-8", "pl-8");
  });
});
