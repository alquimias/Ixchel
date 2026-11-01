import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoginScreen } from './LoginScreen';

const meta = {
  title: 'Login/LoginScreen',
  component: LoginScreen,
  args: {
    showPassword: true,
    onSubmit: async () => undefined,
  },
} satisfies Meta<typeof LoginScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Password: Story = {};

export const Username: Story = {
  args: {
    identifier: 'username',
  },
};

export const WithFormFooter: Story = {
  args: {
    formFooter: <a href="/recuperar-contrasena">¿Olvidaste tu contraseña?</a>,
  },
};
