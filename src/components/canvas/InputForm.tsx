import { Modal, TextInput, Button } from '@mantine/core';
import { useForm } from '@mantine/form';
import React from 'react';
import '../InputForm.css';

type InputFormProps = {
  opened: boolean;
  onClose: () => void;
  onSubmit: (values: { email: string }) => void;
};

export const InputForm: React.FC<InputFormProps> = ({
  opened,
  onClose,
  onSubmit,
}) => {
  const form = useForm({
    initialValues: { email: '' },
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      withCloseButton={false}
      size="auto"
      padding={0}
      styles={{
        body: { padding: 0 },
        content: { background: 'transparent' },
      }}
      classNames={{
        overlay: 'lead-modal-overlay',
        inner: 'lead-modal-inner',
        content: 'lead-modal-content',
        body: 'lead-modal-body',
      }}
    >
      <form
        onSubmit={form.onSubmit(onSubmit)}
        className="lead-form"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="lead-close-btn"
          aria-label="Close"
        >
          ×
        </button>

        {/* Lock Icon */}
        <div className="lead-icon-container">
          <svg
            className="lead-lock-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="5" y="11" width="14" height="10" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2 className="lead-title">Join the Waitlist</h2>
        <p className="lead-subtitle">
          Secure your place in the future of private storage. Early members receive lifetime priority access and onyx-tier encryption.
        </p>

        <div className="lead-inputs-container">
          <div className="lead-field-group">
            <label className="lead-field-label">IDENTITY (EMAIL)</label>
            <TextInput
              classNames={{ input: "lead-input" }}
              placeholder="name@domain.com"
              type="email"
              required
              {...form.getInputProps('email')}
            />
          </div>
        </div>

        <Button
          fullWidth
          type="submit"
          className="lead-button"
        >
          SECURE ACCESS
        </Button>

        <div className="lead-footer">
          <svg
            className="lead-shield-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>ENCRYPTED & PRIVATE</span>
        </div>
      </form>
    </Modal>
  );
};