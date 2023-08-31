/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Platform, Alert, ActivityIndicator, Linking } from 'react-native';
import TouchID from 'react-native-touch-id';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';

// mock server functions
const verifyUserCredentials = payload => {
  // make an HTTP request to the server and verify user credentials
  return { userId: '123456' };
};

const sendPublicKeyToServer = publicKey => {
  // make an HTTP request to the server and save the `publicKey` on the user's entity
  console.log({ publicKey });
};

const verifySignatureWithServer = async ({ signature, payload }) => {
  // make an HTTP request to the server and verify the signature with the public key.

  return { status: 'success' };
};
const INPUT_OFFSET = 110;

function App() {
  const [ErrWarning, setErrWarning] = useState("");
  const [form, setForm] = useState({
    email: '',
    password: '',
  });


  const Checkbiometric = () => {
    // const optionalConfigObject = {
    //   unifiedErrors: false, // use unified error messages (default false)
    //   passcodeFallback: false // if true is passed, it will allow isSupported to return an error if the device is not enrolled in touch id/face id etc. Otherwise, it will just tell you what method is supported, even if the user is not enrolled.  (default false)
    // }

    const optionalConfigObject = {
      title: 'Authentication Required', // Android
      imageColor: '#e00606', // Android
      imageErrorColor: '#ff0000', // Android
      sensorDescription: 'Touch sensor', // Android
      sensorErrorDescription: 'Failed', // Android
      cancelText: 'Cancel', // Android
      fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
      unifiedErrors: false, // use unified error messages (default false)
      passcodeFallback: false, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
    };

    return new Promise((resolve, reject) => {
      //isSupported returns both cases 1. if supported 2. Is enabled/configured/enrolled
      TouchID.isSupported(optionalConfigObject)
        .then(biometryType => {
          // Success code.
          // as we are focusing on fingerprint for now 
          console.log("biometryType", biometryType)
          if (biometryType && biometryType != 'FaceID') {
            resolve(true);
          } else {
            let fingerprintLableForOS = Platform.OS == "ios" ? "Touch ID" : "Fingerprint";
            reject(fingerprintLableForOS + " is not available on this device");
          }
        })
        .catch(error => {
          console.log("error", error.code)
          // iOS Error Format and android error formats are different
          // android use code and ios use name
          // check at https://github.com/naoufal/react-native-touch-id
          let errorCode = Platform.OS == "ios" ? error.name : error.code;
          if (errorCode === "LAErrorTouchIDNotEnrolled" || errorCode === "NOT_AVAILABLE" || errorCode === "NOT_ENROLLED") {
            let fingerprintLableForOS = Platform.OS == "ios" ? "Touch ID" : "Fingerprint";
            resolve(fingerprintLableForOS + " has no enrolled fingers. Please go to settings and enable " + fingerprintLableForOS + " on this device.");
          } else {
            reject(Platform.OS == "ios" ? error.message : translations.t(error.code));
          }
        });
    });
  }

  const authenticateFingerPrint = () => {
    return new Promise((resolve, reject) => {
      // configuration object for more detailed dialog setup and style:
      // const optionalConfigObject = {
      //     title: 'Authentication Required', // Android
      //     imageColor: '#e00606', // Android
      //     imageErrorColor: '#ff0000', // Android
      //     sensorDescription: 'Touch sensor', // Android
      //     sensorErrorDescription: 'Failed', // Android
      //     cancelText: 'Cancel', // Android
      //     fallbackLabel: 'Show Passcode', // iOS (if empty, then label is hidden)
      //     unifiedErrors: false, // use unified error messages (default false)
      //     passcodeFallback: false, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
      // };
      let fingerprintLableForOS = Platform.OS == "ios" ? "Touch ID" : "Fingerprint";

      TouchID.authenticate('Login to this app using ' + fingerprintLableForOS)
        .then(success => {
          console.log('Authenticated Successfully', success)
          resolve(success)
        })
        .catch(error => {
          console.log('Authentication Failed', error.code)
          reject(error)
        });
    });
  }

  const onBioLogin = () => {
    Checkbiometric()
      .then((res) => {
        console.log("res", res);
        setErrWarning(res.toString())

        if (res === true) {
          //fingerprint is supported and enrolled
          //TODO: we’ll work here in the next step
          authenticateFingerPrint()
            .then((res) => {
              console.log("authenticateFingerPrint res", res)
            })
            .catch((e) => {
              console.log("authenticateFingerPrint err", e)
            })
        } else {
          //show alert "TouchID has no enrolled fingers. Please go to settings and enable fingerprint on this device." that we returned from the service
          Alert.alert(
            "Alert",
            res,
            [{
              text: 'Ok', onPress: () => {
                //redirect to settings
                // Platform.OS === "ios"
                //   ? Linking.openURL('app-settings:')
                //   : AndroidOpenSettings.securitySettings() // Open security settings menu

                Linking.openSettings();

              }
            }]
          );
        }

      })
      .catch((e) => {
        console.log("TestBFuncErr", e)
      })
  }

  return (

    <SafeAreaView style={{ flex: 1, backgroundColor: '#e8ecf4' }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Text style={{ fontSize: 44 }}>🗿</Text>
          </View>

          <Text style={styles.title}>
            Welcome to <Text style={{ color: '#0742fc' }}>Demo App</Text>
          </Text>

          <Text style={styles.subtitle}>Collaborate with your friends</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.input}>
            <Text style={styles.inputLabel}>Email address</Text>

            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={email => setForm({ ...form, email })}
              placeholder=""
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              value={form.email}
            />
          </View>

          <View style={styles.input}>
            <Text style={styles.inputLabel}>Password</Text>

            <TextInput
              autoCorrect={false}
              onChangeText={password => setForm({ ...form, password })}
              placeholder=""
              placeholderTextColor="#6b7280"
              style={styles.inputControl}
              secureTextEntry={true}
              value={form.password}
            />
          </View>

          <View style={styles.formAction}>
            <TouchableOpacity
              onPress={async () => {
                const { userId } = await verifyUserCredentials(form);

                // handle onPress
                const rnBiometrics = new ReactNativeBiometrics();

                const { available, biometryType } =
                  await rnBiometrics.isSensorAvailable();

                if (available && biometryType === BiometryTypes.FaceID) {
                  Alert.alert(
                    'Face ID',
                    'Would you like to enable Face ID authentication for the next time?',
                    [
                      {
                        text: 'Yes please',
                        onPress: async () => {
                          const { publicKey } = await rnBiometrics.createKeys();

                          await sendPublicKeyToServer(publicKey);

                          // save `userId` in the local storage to use it during Face ID authentication
                          await AsyncStorage.setItem('userId', userId);
                        },
                      },
                      { text: 'Cancel', style: 'cancel' },
                    ],
                  );
                }
              }}>
              <View style={styles.btn}>
                <Text style={styles.btnText}>Sign in</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.formActionSpacer} />

            <TouchableOpacity
              onPress={async () => {
                const rnBiometrics = new ReactNativeBiometrics();
                const { available, biometryType } =
                  await rnBiometrics.isSensorAvailable();

                if (!available || biometryType !== BiometryTypes.FaceID) {
                  Alert.alert(
                    'Oops!',
                    'Face ID is not available on this device.',
                  );
                  return;
                }

                const userId = await AsyncStorage.getItem('userId');

                if (!userId) {
                  Alert.alert(
                    'Oops!',
                    'You have to sign in using your credentials first to enable Face ID.',
                  );
                  return;
                }

                const timestamp = Math.round(
                  new Date().getTime() / 1000,
                ).toString();
                const payload = `${userId}__${timestamp}`;

                const { success, signature } = await rnBiometrics.createSignature(
                  {
                    promptMessage: 'Sign in',
                    payload,
                  },
                );

                if (!success) {
                  Alert.alert(
                    'Oops!',
                    'Something went wrong during authentication with Face ID. Please try again.',
                  );
                  return;
                }

                const { status, message } = await verifySignatureWithServer({
                  signature,
                  payload,
                });

                if (status !== 'success') {
                  Alert.alert('Oops!', message);
                  return;
                }

                Alert.alert('Success!', 'You are successfully authenticated!');
              }}>
              <View style={styles.btnSecondary}>


                <Text style={styles.btnSecondaryText}>🗿 Face ID</Text>

                <View style={{ width: 34 }} />
              </View>

            </TouchableOpacity>


            <TouchableOpacity style={[styles.btnSecondary, { marginTop: 10 }]}
              onPress={() => {
                onBioLogin()
              }}
            >


              <Text style={styles.btnSecondaryText}>🖐 Finger Print</Text>

              <View style={{ width: 34 }} />
            </TouchableOpacity>
          </View>

          <Text style={styles.formFooter}>
            By clicking "Sign in" above, you agree to RealApps's
            <Text style={{ fontWeight: '600' }}> Terms & Conditions </Text>
            and
            <Text style={{ fontWeight: '600' }}> Privacy Policy</Text>.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   backgroundColor: "#fff"
  // },
  container: {
    padding: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  header: {
    marginVertical: 36,
  },
  headerIcon: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    marginBottom: 36,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 27,
    fontWeight: '700',
    color: '#1d1d1d',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#929292',
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  formAction: {
    marginVertical: 24,
  },
  formActionSpacer: {
    marginVertical: 8,
  },
  formFooter: {
    marginTop: 'auto',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: '#929292',
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  inputControl: {
    height: 44,
    backgroundColor: '#fff',
    paddingLeft: INPUT_OFFSET,
    paddingRight: 24,
    borderRadius: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
  },
  inputLabel: {
    position: 'absolute',
    width: INPUT_OFFSET,
    lineHeight: 44,
    top: 0,
    left: 0,
    bottom: 0,
    marginHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: '500',
    color: '#c0c0c0',
    zIndex: 9,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: '#000',
    borderColor: '#000',
  },
  btnText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#fff',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    backgroundColor: 'transparent',
    borderColor: '#000',
  },
  btnSecondaryText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    color: '#000',
  },
});

export default App;
