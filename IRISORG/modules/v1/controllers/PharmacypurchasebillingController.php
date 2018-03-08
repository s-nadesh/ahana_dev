<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PhaPurchase;
use common\models\PhaPurchaseBilling;
use common\models\PhaSale;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class PharmacypurchasebillingController extends ActiveController {

    public $modelClass = 'common\models\PhaPurchaseBilling';

    public function behaviors() {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => QueryParamAuth::className()
        ];
        $behaviors['contentNegotiator'] = [
            'class' => ContentNegotiator::className(),
            'formats' => [
                'application/json' => Response::FORMAT_JSON,
            ],
        ];

        return $behaviors;
    }

    public function actions() {
        $actions = parent::actions();
        $actions['index']['prepareDataProvider'] = [$this, 'prepareDataProvider'];

        return $actions;
    }

    public function prepareDataProvider() {
        /* @var $modelClass BaseActiveRecord */
        $modelClass = $this->modelClass;

        return new ActiveDataProvider([
            'query' => $modelClass::find()->tenant()->active()->orderBy(['created_at' => SORT_DESC]),
            'pagination' => false,
        ]);
    }

    public function actionRemove() {
        $id = Yii::$app->getRequest()->post('id');
        if ($id) {
            $model = PhaPurchaseBilling::find()->where(['purchase_billing_id' => $id])->one();
            $model->remove();
            return ['success' => true];
        }
    }

    public function actionMakepayment() {
        $post = Yii::$app->getRequest()->post();

        if (!empty($post)) {
            $model = new PhaPurchaseBilling;
            $model->attributes = $post;
            $valid = $model->validate();

            if ($valid) {
                $purchase = PhaPurchase::find()->tenant()->andWhere(['purchase_id' => $post['purchase_id']])->one();
                if (!empty($purchase)) {
                    $model = new PhaPurchaseBilling;
                    $model->attributes = [
                        'purchase_id' => $purchase->purchase_id,
                        'paid_date' => $post['paid_date'],
                        'paid_amount' => $post['paid_amount'],
                    ];
                    $model->save(false);
                }
                return ['success' => true];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$model])];
            }
        } else {
            return ['success' => false, 'message' => 'Fill the Form'];
        }
    }

}
