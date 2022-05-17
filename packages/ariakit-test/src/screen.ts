import { screen } from "@testing-library/react";

export { screen };

export const getByText = screen.getByText;
export const getByLabelText = screen.getByLabelText;
export const getByRole = screen.getByRole;
export const getByPlaceholderText = screen.getByPlaceholderText;

export const queryByText = screen.queryByText;
export const queryByLabelText = screen.queryByLabelText;
export const queryByRole = screen.queryByRole;
export const queryByPlaceholderText = screen.queryByPlaceholderText;

export const getAllByText = screen.getAllByText;
export const getAllByLabelText = screen.getAllByLabelText;
export const getAllByRole = screen.getAllByRole;
export const getAllByPlaceholderText = screen.getAllByPlaceholderText;

export const queryAllByText = screen.queryAllByText;
export const queryAllByLabelText = screen.queryAllByLabelText;
export const queryAllByRole = screen.queryAllByRole;
export const queryAllByPlaceholderText = screen.queryAllByPlaceholderText;
