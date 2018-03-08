<?php

namespace common\models;

use yii\base\Model;

/**
 *
 * @property string $username
 * @property string $password
 */
class CoLoginForm extends Model {
    
    public $username;
    public $password;

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['username'], 'required'],
            [['password'], 'required', 'on' => 'create'],
            [['username'], 'validateUsername'],
            [['password'], 'validateUserpassword'],
            [['username', 'password'], 'safe'],
//            [['username', 'password'], 'string', 'min' => 6],
//            [['username', 'password'], 'string', 'max' => 255],
        ];
    }

    public function validateUsername($attribute, $params) {
        if (preg_match('/\\s/', $this->$attribute) || preg_match('/[\'^£$%&*()}{@#~?><>,|=_+¬-]/', $this->$attribute)) {
            $this->addError($attribute, 'Invalid characters in username.(Spaces or Special Characters not Allowed)');
        }
    }

    public function validateUserpassword($attribute, $params) {
        if (preg_match('/\\s/', $this->$attribute)) {
            $this->addError($attribute, 'Invalid characters in password.(Space not Allowed)');
        }
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'username' => 'Username',
            'password' => 'Password',
        ];
    }

}
