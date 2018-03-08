<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PhaProductBatch;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class PharmacyproductbatchController extends ActiveController {

    public $modelClass = 'common\models\PhaProductBatch';

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
            $model = PhaProductBatch::find()->where(['product_id' => $id])->one();
            $model->remove();
            return ['success' => true];
        }
    }

    public function actionGetbatchbyproduct() {
        $get = Yii::$app->getRequest()->get();
        $product_id = explode(',', $get['product_id']);

        return ['batchList' => PhaProductBatch::find()->tenant()->andWhere(['product_id' => $product_id])->andWhere('available_qty > 0')->orderBy(['expiry_date' => SORT_ASC])->all()];
    }
    
    public function actionShortexpiry() {
        $reports = PhaProductBatch::find()->tenant()
                ->andWhere("pha_product_batch.expiry_date between CURDATE() AND CURDATE()+ INTERVAL 6 MONTH")
                ->orderBy(['expiry_date' => SORT_ASC])
                ->all();
        return ['report' => $reports];        
    }
}
