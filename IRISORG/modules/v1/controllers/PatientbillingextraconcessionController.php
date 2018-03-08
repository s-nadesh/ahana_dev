<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PatBillingExtraConcession;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\helpers\Html;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class PatientbillingextraconcessionController extends ActiveController {

    public $modelClass = 'common\models\PatBillingExtraConcession';

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
            $model = PatBillingExtraConcession::find()->where(['other_charge_id' => $id])->one();
            $model->remove();
            return ['success' => true];
        }
    }

    public function actionAddcharge() {
        $post = Yii::$app->request->post();
        if (!empty($post)) {
            $model = PatBillingExtraConcession::find()->tenant()->andWhere(['ec_type' => $post['ec_type'], 'encounter_id' => $post['encounter_id'], 'link_id' => $post['link_id']])->one();
            
            if(empty($model))
                $model = new PatBillingExtraConcession();
            
            $model->attributes = Yii::$app->request->post();

            $valid = $model->validate();

            if ($valid) {
                $model->save(false);
                return ['success' => true];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$model])];
            }
        } else {
            return ['success' => false, 'message' => 'Please Fill the Form'];
        }
    }

}
