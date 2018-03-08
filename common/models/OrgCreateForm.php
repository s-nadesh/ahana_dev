<?php

namespace common\models;

use Yii;
use yii\base\Model;

/**
 * Login form
 */
class OrgCreateForm extends Model {

    public $username;
    public $password;
    public $title_code;
    public $name;
    public $designation;
    public $mobile;
    public $email;
    public $address;
    public $country_id;
    public $state_id;
    public $city_id;
    //public $rememberMe = true;

    private $_user = false;

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            // username and password are both required
            [['username', 'password'], 'required', 'on' => 'step2'],
            [['title_code', 'name', 'designation', 'mobile', 'email', 'address', 'country_id', 'state_id', 'city_id'], 'required', 'on' => 'step_user'],
//            [['username', 'password'], 'string', 'min' => 6],
                // rememberMe must be a boolean value
                //['rememberMe', 'boolean'],
                // password is validated by validatePassword()
//            ['password', 'validatePassword'],
//            ['tenant_id', 'validateTenant'],
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
            $user = $this->getUser();
            if (!$user || !$user->validatePassword($this->password)) {
                $this->addError($attribute, 'Incorrect username or password.');
            }
        }
    }

    public function validateTenant($attribute, $params) {
        if (!$this->hasErrors()) {
            $tenant = CoLogin::findByUsernameAndTenant($this->username, $this->tenant_id);
            if (empty($tenant)) {
                $this->addError($attribute, 'Organization mismatch.');
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
            $this->_user = CoLogin::findByUsername($this->username);
        }

        return $this->_user;
    }

    public function setToken() {
        if ($this->_user !== false) {
            $this->_user->authtoken = base64_encode($this->_user->username . time() . rand(1000, 9999));
            $this->_user->save(false);
        }

        return $this->_user;
    }

    /**
     * Generates password hash from password and sets it to the model
     *
     * @param string $password
     */
    public function setPassword($password) {
        return Yii::$app->security->generatePasswordHash($password);
    }

}
