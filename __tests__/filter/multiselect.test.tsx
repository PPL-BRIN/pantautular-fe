import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MultiSelect } from "../../app/components/filter/MultiSelect";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  jest.clearAllTimers();
});

describe("MultiSelect Component", () => {
  it("renders with placeholder text", () => {
    render(<MultiSelect options={[]} selected={[]} onChange={() => {}} placeholder="Pilih opsi..." />);
    expect(screen.getByText("Pilih opsi...")).toBeInTheDocument();
  });

  it("displays selected options", () => {
    render(<MultiSelect options={["A", "B", "C"]} selected={["A", "B"]} onChange={() => {}} />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("removes an option when clicking on the close button", () => {
    const onChange = jest.fn();
    render(<MultiSelect options={["A", "B", "C"]} selected={["A", "B"]} onChange={onChange} />);
  
    const badge = screen.getByText("A").closest("div");
    expect(badge).toBeInTheDocument();
  
    const closeButton = badge?.querySelector("button");
    expect(closeButton).toBeInTheDocument();
  
    fireEvent.click(closeButton!);
    expect(onChange).toHaveBeenCalledWith(["B"]);
  });

  it("handles empty options list gracefully", () => {
    render(<MultiSelect options={[]} selected={[]} onChange={() => {}} />);
    expect(screen.queryByText("Pilih Semua")).not.toBeInTheDocument();
  });
});
