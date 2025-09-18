import React, { createContext, useContext, useEffect, useState } from "react";
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const poolData = {
    UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || "",
    ClientId: process.env.REACT_APP_COGNITO_APP_CLIENT_ID || "",
  };

  const userPool = new CognitoUserPool(poolData);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already authenticated on app start
  useEffect(() => {
    checkAuthState();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuthState = () => {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.getSession((err, session) => {
        if (err || !session.isValid()) {
          setUser(null);
        } else {
          setUser(currentUser);
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  };

  const signUp = (email, password, name) => {
    return new Promise((resolve, reject) => {
      const attributeList = [
        {
          Name: 'email',
          Value: email
        },
        {
          Name: 'name',
          Value: name
        }
      ];

      // Generate a unique username since email is used as alias
      const username = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      userPool.signUp(username, password, attributeList, null, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        // Store the username locally for confirmation
        localStorage.setItem('cognito_signup_username', username);
        resolve(result);
      });
    });
  };

  const confirmSignUp = (email, code) => {
    return new Promise((resolve, reject) => {
      // Use the stored username from signup
      const username = localStorage.getItem('cognito_signup_username') || email;
      
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool
      });

      cognitoUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        // Clear the stored username after successful confirmation
        localStorage.removeItem('cognito_signup_username');
        resolve(result);
      });
    });
  };

  const signIn = (email, password) => {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (session) => {
          setUser(cognitoUser);
          resolve(session);
        },
        onFailure: (err) => {
          reject(err);
        },
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          // This happens when user needs to set a new password
          reject(new Error("New password required"));
        }
      });
    });
  };

  const signOut = () => {
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
      currentUser.signOut();
    }
    setUser(null);
  };

  const getIdToken = () => {
    return new Promise((resolve, reject) => {
      if (!user) {
        resolve(null);
        return;
      }

      user.getSession((err, session) => {
        if (err) {
          reject(err);
          return;
        }

        if (session.isValid()) {
          resolve(session.getIdToken().getJwtToken());
        } else {
          resolve(null);
        }
      });
    });
  };

  const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
      if (!user) {
        resolve(null);
        return;
      }

      user.getUserAttributes((err, attributes) => {
        if (err) {
          reject(err);
          return;
        }

        const userInfo = {};
        attributes.forEach(attr => {
          userInfo[attr.Name] = attr.Value;
        });

        resolve(userInfo);
      });
    });
  };

  const forgotPassword = (email) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.forgotPassword({
        onSuccess: (result) => {
          resolve(result);
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  };

  const confirmPassword = (email, code, newPassword) => {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool
      });

      cognitoUser.confirmPassword(code, newPassword, {
        onSuccess: () => {
          resolve("Password reset successful");
        },
        onFailure: (err) => {
          reject(err);
        }
      });
    });
  };

  const value = {
    user,
    loading,
    signUp,
    confirmSignUp,
    signIn,
    signOut,
    getIdToken,
    getCurrentUser,
    forgotPassword,
    confirmPassword,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
