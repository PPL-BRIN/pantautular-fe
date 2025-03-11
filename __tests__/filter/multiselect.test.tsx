import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MultiSelect } from "../../app/components/filter/MultiSelect";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  Element.prototype.scrollIntoView = jest.fn();
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  jest.clearAllTimers();
});

describe("MultiSelect Component", () => {
  it("renders with placeholder text", () => {
    render(<MultiSelect options={[]} selected={[]} onChange={() => {}} placeholder="Pilih opsi..." isOpen={false} setOpen={() => {}} />);
    expect(screen.getByText("Pilih opsi...")).toBeInTheDocument();
  });

  it("displays selected options", () => {
    render(<MultiSelect options={["A", "B", "C"]} selected={["A", "B"]} onChange={() => {}} isOpen={false} setOpen={() => {}} />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("removes an option when clicking on the close button", () => {
    const onChange = jest.fn();
    render(<MultiSelect options={["A", "B", "C"]} selected={["A", "B"]} onChange={onChange} isOpen={false} setOpen={() => {}} />);
  
    const closeButton = screen.getAllByRole("button")[0]; // First X button
    fireEvent.click(closeButton);
    expect(onChange).toHaveBeenCalledWith(["B"]);
  });

  it("handles dropdown when clicking on the component", () => {
    const setOpen = jest.fn();
    render(<MultiSelect options={["A", "B", "C"]} selected={[]} onChange={() => {}} isOpen={false} setOpen={setOpen} />);
    
    const dropdown = screen.getByText("Pilih opsi...").closest("div");
    fireEvent.click(dropdown!);
    expect(setOpen).toHaveBeenCalled();
  });

  it("shows 'Pilih Semua' when dropdown is open and no options are selected", () => {
    render(<MultiSelect options={["A", "B", "C"]} selected={[]} onChange={() => {}} isOpen={true} setOpen={() => {}} />);
    expect(screen.getByText("Pilih Semua")).toBeInTheDocument();
  });

  it("doesn't show dropdown content when isOpen is false", () => {
    render(<MultiSelect options={["A", "B", "C"]} selected={[]} onChange={() => {}} isOpen={false} setOpen={() => {}} />);
    expect(screen.queryByText("Pilih Semua")).not.toBeInTheDocument();
  });

  it("selects all options when clicking 'Pilih Semua'", () => {
    const onChange = jest.fn();
    const setOpen = jest.fn();
    render(<MultiSelect options={["A", "B", "C"]} selected={[]} onChange={onChange} isOpen={true} setOpen={setOpen} />);
    
    fireEvent.click(screen.getByText("Pilih Semua"));
    expect(onChange).toHaveBeenCalledWith(["A", "B", "C"]);
    expect(setOpen).toHaveBeenCalled();
  });

  it("selects an individual option when clicking on it", () => {
    const onChange = jest.fn();
    const setOpen = jest.fn();
    render(<MultiSelect options={["A", "B", "C"]} selected={["B"]} onChange={onChange} isOpen={true} setOpen={setOpen} />);
    
    fireEvent.click(screen.getByText("A"));
    expect(onChange).toHaveBeenCalledWith(["B", "A"]);
    expect(setOpen).toHaveBeenCalled();
  });

  it("shows 'Tidak ada hasil.' when dropdown is open but has no selectable options", () => {
    render(<MultiSelect options={["A", "B", "C"]} selected={["A", "B"]} onChange={() => {}} isOpen={true} setOpen={() => {}} />);
    expect(screen.getByText("Pilih Semua")).toBeInTheDocument();
  });
});
