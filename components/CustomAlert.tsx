import React, { createContext, useContext, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface AlertOptions {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'confirm';
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface AlertContextType {
  showAlert: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText?: string,
    cancelText?: string
  ) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export const CustomAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<AlertOptions>({
    title: '',
    message: '',
    type: 'info',
  });

  const showAlert = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setConfig({ title, message, type });
    setVisible(true);
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = '확인',
    cancelText = '취소'
  ) => {
    setConfig({
      title,
      message,
      type: 'confirm',
      onConfirm,
      confirmText,
      cancelText,
    });
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  const handleConfirm = () => {
    setVisible(false);
    if (config.onConfirm) {
      config.onConfirm();
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.alertContainer}>
            <View style={styles.iconWrapper}>
              {config.type === 'success' && <Ionicons name="checkmark-circle" size={44} color={Colors.light.primary} />}
              {config.type === 'warning' && <Ionicons name="alert-circle" size={44} color="#FF9500" />}
              {config.type === 'confirm' && <Ionicons name="help-circle" size={44} color="#FF9500" />}
              {config.type === 'info' && <Ionicons name="information-circle" size={44} color={Colors.light.primary} />}
            </View>

            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.message}>{config.message}</Text>

            <View style={styles.btnRow}>
              {config.type === 'confirm' ? (
                <>
                  <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={handleClose}>
                    <Text style={styles.cancelBtnText}>{config.cancelText || '취소'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.confirmBtn]} onPress={handleConfirm}>
                    <Text style={styles.confirmBtnText}>{config.confirmText || '확인'}</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={[styles.btn, styles.confirmBtn, { width: '100%' }]} onPress={handleClose}>
                  <Text style={styles.confirmBtnText}>확인</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within CustomAlertProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  iconWrapper: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F2F2F7',
  },
  cancelBtnText: {
    color: '#666666',
    fontWeight: '700',
    fontSize: 15,
  },
  confirmBtn: {
    backgroundColor: Colors.light.primary,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
});