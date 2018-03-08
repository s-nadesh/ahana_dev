<?php

namespace common\models;

use Yii;
use yii\base\Model;

/**
 * Login form
 */
class IrisLoginForm extends Model {

    public $username;
    public $password;
    //public $rememberMe = true;


    private $_user = false;

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            // username and password are both required
            [['username', 'password'], 'required'],
            // rememberMe must be a boolean value
            //['rememberMe', 'boolean'],
            // password is validated by validatePassword()
            ['password', 'validatePassword'],
        ];
    }

    /**
     * Validates the password.
     * This method serves as the inline validation for password.
     *
     * @param string $attribute the attribute currently being validated
     * @param array $params the additional name-value pairs given in the rule
     */
    public function validatePassword($attribute, $params) {
        if (!$this->hasErrors()) {
            if ($this->password)
                $user = $this->getUser();
            if (!$user || !$user->validatePassword($this->password)) {
                $this->addError($attribute, 'Invalid user credentials.');
            }
        }
    }

    /**
     * Logs in a user using the provided username and password.
     *
     * @return boolean whether the user is logged in successfully
     */
    public function login() {
        if ($this->validate()) {
            $this->setToken();
            return Yii::$app->user->login($this->getUser()/* , $this->rememberMe ? 3600 * 24 * 30 : 0 */);
        } else {
            return false;
        }
    }

    /**
     * Finds user by [[username]]
     *
     * @return User|null
     */
    public function getUser() {
        if ($this->_user === false) {
            $this->_user = CoSuperAdmin::findByUsername($this->username);
        }

        return $this->_user;
    }

    public function setToken() {
        if ($this->_user !== false) {
            $this->_user->authtoken = base64_encode($this->_user->username.time().rand(1000, 9999));
            $this->_user->save(false);
        }

        return $this->_user;
    }

}
