<?php
namespace common\models;

use Yii;
use yii\base\Model;

/**
 * Password reset request form
 */
class PasswordResetRequestForm extends Model
{
    public $email;
    public $tenant_id;

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            ['email', 'filter', 'filter' => 'trim'],
            ['email', 'required'],
            ['email', 'email'],
            ['email', 'exist',
                'targetClass' => '\common\models\CoUser',
                'filter' => ['status' => CoUser::STATUS_ACTIVE],
                'message' => 'There is no user with such email.'
            ],
            [['tenant_id'], 'safe'],
        ];
    }

    /**
     * Sends an email with a link, for resetting the password.
     *
     * @return boolean whether the email was send
     */
    public function sendEmail()
    {
        /* @var $user User */
        $user = CoUser::find()->where(['email' => $this->email, 'status' => CoUser::STATUS_ACTIVE])->andWhere(['tenant_id' => $this->tenant_id])->orWhere(['tenant_id' => 0])->one();
        
//        $user = CoUser::findOne([
//            'status' => CoUser::STATUS_ACTIVE,
//            'email' => $this->email,
//            'tenant_id' => $this->tenant_id,
//        ]);
        
        $user = isset($user->login) ? $user->login : [];

        if ($user) {
            if (!CoLogin::isPasswordResetTokenValid($user->password_reset_token)) {
                $user->generatePasswordResetToken();
            }

            if ($user->save()) {
                return Yii::$app->mailer->compose(['html' => 'passwordResetToken-html', 'text' => 'passwordResetToken-text'], ['user' => $user])
                    ->setFrom([Yii::$app->params['supportEmail'] => Yii::$app->name . ' robot'])
                    ->setTo($this->email)
                    ->setSubject('Password reset for ' . Yii::$app->name)
                    ->send();
            }
        }

        return false;
    }
}
