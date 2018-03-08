<?php

namespace IRISADMIN\modules\v1\controllers;

use common\models\CoSuperAdmin;
use common\models\IrisLoginForm;
use IRISADMIN\models\ContactForm;
use Yii;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\ContentNegotiator;
use yii\helpers\Html;
use yii\rest\Controller;
use yii\web\Response;

/**
 * User controller
 */
class UserController extends Controller {

    /**
     * @inheritdoc
     */
    public function behaviors() {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::className(),
            'only' => ['myidentity', 'logout'],
        ];
        $behaviors['contentNegotiator'] = [
            'class' => ContentNegotiator::className(),
            'formats' => [
                'application/json' => Response::FORMAT_JSON,
            ],
        ];

        return $behaviors;
    }

    public function actionLogin() {
        $model = new IrisLoginForm();

        if ($model->load(Yii::$app->getRequest()->getBodyParams(), '') && $model->login()) {
            return ['success' => true, 'access_token' => Yii::$app->user->identity->getAuthKey()];
        } elseif (!$model->validate()) {
            return ['success' => false, 'message' => Html::errorSummary([$model])];
        }
    }

    public function actionLogout() {
        $model = CoSuperAdmin::findOne(['su_id' => Yii::$app->user->identity->su_id]);
        if (!empty($model)) {
            $model->attributes = ['authtoken' => ''];
            if ($model->save())
                return ['success' => true];
            else
                return ['success' => false, 'message' => Html::errorSummary([$model])];
        } else {
            return ['success' => false, 'message' => 'Try again later'];
        }
    }

    public function actionMyidentity() {
        $response = [
            'username' => Yii::$app->user->identity->username,
            'access_token' => Yii::$app->user->identity->getAuthKey(),
        ];

        return $response;
    }

    public function actionContact() {

        $model = new ContactForm();
        if ($model->load(Yii::$app->getRequest()->getBodyParams(), '') && $model->validate()) {
            if ($model->sendEmail(Yii::$app->params['adminEmail'])) {
                $response = [
                    'flash' => [
                        'class' => 'success',
                        'message' => 'Thank you for contacting us. We will respond to you as soon as possible.',
                    ]
                ];
            } else {
                $response = [
                    'flash' => [
                        'class' => 'error',
                        'message' => 'There was an error sending email.',
                    ]
                ];
            }
            return $response;
        } else {
            $model->validate();
            return $model;
        }
    }

}
