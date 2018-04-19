<?php

namespace common\models;

use Yii;
use yii\behaviors\BlameableBehavior;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveQuery;
use yii\db\ActiveRecord;
use yii\db\Expression;
use yii\web\IdentityInterface;

/**
 * This is the model class for table "co_login".
 *
 * @property integer $login_id
 * @property integer $user_id
 * @property string $username
 * @property string $password
 * @property string $password_reset_token
 * @property string $authtoken
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $activation_date
 * @property string $Inactivation_date
 *
 * @property CoUser $user
 */
class CoLogin extends ActiveRecord implements IdentityInterface {

    public $access_tenant_id;
    public $old_password;
    public $new_password;
    public $confirm_password;
    public $update_log = true; //This should be false when you create login from CRM 

    /**
     * @inheritdoc
     */

    public static function tableName() {
        return 'co_login';
    }

    public function behaviors() {
        return [
                [
                'class' => TimestampBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['created_at', 'modified_at'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['modified_at'],
                ],
                'value' => new Expression('NOW()')
            ],
                [
                'class' => BlameableBehavior::className(),
                'updatedByAttribute' => 'modified_by',
                'value' => function ($event) {
                    if (isset(Yii::$app->user->identity->user_id))
                        return Yii::$app->user->identity->user_id;
                }
            ],
        ];
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['username'], 'required'],
                [['password'], 'required', 'on' => 'create'],
                [['username'], 'validateUsername'],
                [['password'], 'validateUserpassword'],
                [['old_password', 'new_password', 'confirm_password'], 'required', 'on' => 'change_password'],
                [['new_password'], 'validateUserpassword'],
                ['old_password', 'findPasswords', 'on' => 'change_password'],
                ['confirm_password', 'compare', 'compareAttribute' => 'new_password', 'on' => 'change_password'],
//            [['username', 'password'], 'string', 'min' => 6],
            [['user_id', 'created_by', 'modified_by', 'logged_tenant_id', 'access_tenant_id'], 'integer'],
                [['created_at', 'modified_at', 'activation_date', 'Inactivation_date', 'logged_tenant_id', 'access_tenant_id'], 'safe'],
                [['username', 'password', 'password_reset_token', 'authtoken'], 'string', 'max' => 255],
                ['username', 'unique'],
        ];
    }

    public function findPasswords($attribute, $params) {
        $check = Yii::$app->security->validatePassword($this->old_password, Yii::$app->user->identity->password);
        if (!$check)
            $this->addError($attribute, 'Old password is incorrect');
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
            'login_id' => 'Login ID',
            'user_id' => 'User ID',
            'username' => 'Username',
            'password' => 'Password',
            'password_reset_token' => 'Password Reset Token',
            'authtoken' => 'Auth Token',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'activation_date' => 'Activation Date',
            'Inactivation_date' => 'Inactivation Date',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getUser() {
        return $this->hasOne(CoUser::className(), ['user_id' => 'user_id']);
    }

    /**
     * @inheritdoc
     */
    public static function findIdentity($id) {
        return static::findOne(['id' => $id]);
    }

    /**
     * @inheritdoc
     */
    public static function findIdentityByAccessToken($token, $type = null) {
        return static::findOne(['md5(authtoken)' => $token]);
    }

    /**
     * Finds user by username
     *
     * @param string $username
     * @return static|null
     */
    public static function findByUsername($username) {
        return static::findOne(['username' => $username]);
    }

    public static function findByUsernameAndTenant($username, $tenant) {
        return static::find()
                ->joinWith(['user', 'user.usersBranches'])
                ->where(['username' => $username, 'co_user.tenant_id' => $tenant])
                ->orWhere(['username' => $username, 'co_user.tenant_id' => 0])
                ->orWhere(['username' => $username, 'co_users_branches.branch_id' => $tenant]) //Task - Branch Login
                ->one();
    }

    /**
     * Finds user by password reset token
     *
     * @param string $token password reset token
     * @return static|null
     */
    public static function findByPasswordResetToken($token) {
        if (!static::isPasswordResetTokenValid($token)) {
            return null;
        }

        return static::findOne([
                    'password_reset_token' => $token
        ]);
    }

    /**
     * Finds out if password reset token is valid
     *
     * @param string $token password reset token
     * @return boolean
     */
    public static function isPasswordResetTokenValid($token) {
        if (empty($token)) {
            return false;
        }
        $expire = Yii::$app->params['user.passwordResetTokenExpire'];
        $parts = explode('_', $token);
        $timestamp = (int) end($parts);
        return $timestamp + $expire >= time();
    }

    /**
     * @inheritdoc
     */
    public function getId() {
        return $this->getPrimaryKey();
    }

    /**
     * @inheritdoc
     */
    public function getAuthKey() {
        return $this->authtoken;
    }

    /**
     * @inheritdoc
     */
    public function validateAuthKey($authKey) {
        return $this->getAuthKey() === $authKey;
    }

    /**
     * Validates password
     *
     * @param string $password password to validate
     * @return boolean if password provided is valid for current user
     */
    public function validatePassword($password) {
        return Yii::$app->security->validatePassword($password, $this->password);
    }

    /**
     * Generates password hash from password and sets it to the model
     *
     * @param string $password
     */
    public function setPassword($password) {
        $this->password = Yii::$app->security->generatePasswordHash($password);
    }

    /**
     * Generates "remember me" authentication key
     */
    public function generateAuthKey() {
        $this->authtoken = Yii::$app->security->generateRandomString();
    }

    /**
     * Generates new password reset token
     */
    public function generatePasswordResetToken() {
        $this->password_reset_token = Yii::$app->security->generateRandomString() . '_' . time();
    }

    /**
     * Removes password reset token
     */
    public function removePasswordResetToken() {
        $this->password_reset_token = null;
    }

    public static function getDb() {
        return Yii::$app->client;
    }

    public function afterSave($insert, $changedAttributes) {
        if ($this->update_log) {
            if ($this->logged_tenant_id) {
                $tenant = CoTenant::find()->where(['tenant_id' => $this->logged_tenant_id])->one();
                if (empty(Yii::$app->user->identity)) {
                    $activity = $this->username . ' logged successfully(#' . $tenant->tenant_name . ')';
                    CoAuditLog::insertAuditLog('', '', $activity, $this->logged_tenant_id, $this->user_id);
                }
                //        else{
//            $activity = $this->username . ' log out successfully(#' . $tenant->tenant_name . ')';
//        }
            }
        }
    }

}
