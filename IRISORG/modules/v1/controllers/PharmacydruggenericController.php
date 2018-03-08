<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PhaDrugClass;
use common\models\PhaDrugGeneric;
use common\models\PhaGeneric;
use common\models\PhaProduct;
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
class PharmacydruggenericController extends ActiveController {

    public $modelClass = 'common\models\PhaDrugGeneric';

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
            'query' => $modelClass::find()->tenant()->active()->groupBy(['drug_class_id'])->orderBy(['created_at' => SORT_DESC]),
            'pagination' => false,
        ]);
    }

    public function actionSavedruggeneric() {
        $post = Yii::$app->request->post();

        $drug_class_id = !isset($post['drug_class_id']) ? '' : $post['drug_class_id'];
        $generic_ids = !empty($post['generic_ids']) ? $post['generic_ids'] : [0 => ''];
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;
        
        //validate
        foreach ($generic_ids as $generic_id) {
            $v_model = new PhaDrugGeneric();
            $v_model->attributes = [
                'drug_class_id' => $drug_class_id,
                'generic_id' => $generic_id,
            ];
            if (!$v_model->validate())
                return ['success' => false, 'message' => Html::errorSummary([$v_model])];
        }
        //

        $this->_link($drug_class_id, $generic_ids);
        PhaProduct::updateAll(['drug_class_id' => $drug_class_id], ['tenant_id' => $tenant_id,'generic_id' => $generic_ids, 'drug_class_id' => null]);
        return ['success' => true];
    }

    public function actionUpdatedruggeneric() {
        $post = Yii::$app->request->post();

        $mode = $post['mode'];
        $drug_class_id = !isset($post['drug_class_id']) ? '' : $post['drug_class_id'];
        $generic_id = !isset($post['generic_id']) ? '' : $post['generic_id'];

        //validate
        if ($mode == 'update') {
            $v_model = new PhaDrugGeneric();
            $v_model->attributes = [
                'drug_class_id' => $drug_class_id,
                'generic_id' => $generic_id,
            ];
            if (!$v_model->validate())
                return ['success' => false, 'message' => Html::errorSummary([$v_model])];
        }
        //

        $generic_ids = ArrayHelper::map(PhaDrugGeneric::find()->tenant()->andWhere(['drug_class_id' => $drug_class_id])->all(), 'generic_id', 'generic_id');
        if ($mode == 'update') {
            $generic_ids[] = $generic_id;
        } else {
            $generic_ids = array_diff($generic_ids, [$generic_id]);
        }
        $this->_link($drug_class_id, $generic_ids);

        return ['success' => true];
    }

    protected function _link($drug_class_id, $generic_ids) {
        $model = PhaDrugClass::find()->tenant()->andWhere(['drug_class_id' => $drug_class_id])->one();
        $generics = PhaGeneric::find()->tenant()->andWhere(['in', 'generic_id', $generic_ids])->all();
        $extraColumns = ['tenant_id' => Yii::$app->user->identity->user->tenant_id, 'created_by' => Yii::$app->user->identity->user_id, 'status' => '1']; // extra columns to be saved to the many to many table
        $unlink = true; // unlink tags not in the list
        $delete = true; // delete unlinked tags
        return $model->linkAll('generics', $generics, $extraColumns, $unlink, $delete);
    }

    public function actionRemove() {
        $id = Yii::$app->getRequest()->post('id');
        if ($id) {
            $model = PhaDrugGeneric::find()->where(['drug_class_id' => $id])->one();
            $model->remove();
            return ['success' => true];
        }
    }
    
    public function actionGetdruggeneric() {
        $modelClass = $this->modelClass;
        $get = Yii::$app->getRequest()->get();
        if($get)
        {
            $limit = isset($get['l']) ? $get['l'] : 5;
            $page = isset($get['p']) ? $get['p'] : 1;
            $offset = abs($page - 1) * $limit;
            $generics = $modelClass::find()->tenant()->active()->groupBy(['drug_class_id'])->limit($limit)->offset($offset)->orderBy(['created_at' => SORT_DESC])->all();
            return ['success' => true, 'generics' => $generics];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

}
