import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StatusView } from "./StatusView";

afterEach(() => cleanup());

describe("StatusView", () => {
  it("does not treat forbidden as empty", () => {
    render(<StatusView state="FORBIDDEN" />);
    expect(screen.getByRole("alert").textContent).toMatch(/restrito/i);
  });

  it("does not treat error as empty", () => {
    render(<StatusView state="ERROR" detail="Falha de rede" />);
    expect(screen.getByRole("alert").textContent).toMatch(/Falha de rede/);
  });
});
