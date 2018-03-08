<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PhaBrand;
use common\models\CoAuditLog;
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
class PharmacybrandController extends ActiveController {

    public $modelClass = 'common\models\PhaBrand';

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
            $model = PhaBrand::find()->where(['brand_id' => $id])->one();
            $model->remove();
            $activity = 'Brand Deleted Successfully (#' . $model->brand_name . ' )';
            CoAuditLog::insertAuditLog(PhaBrand::tableName(), $id, $activity);
            return ['success' => true];
        }
    }

    //Pharmacy Products Index
    public function actionGetbrands() {
        $requestData = $_REQUEST;

        $modelClass = $this->modelClass;
        $totalData = $modelClass::find()->tenant()->active()->count();
        $totalFiltered = $totalData;

        // Order Records
        if (isset($requestData['order'])) {
            if ($requestData['order'][0]['dir'] == 'asc') {
                $sort_dir = SORT_ASC;
            } elseif ($requestData['order'][0]['dir'] == 'desc') {
                $sort_dir = SORT_DESC;
            }
            $order_array = [$requestData['columns'][$requestData['order'][0]['column']]['data'] => $sort_dir];
        }

        // Search Records
        if (!empty($requestData['search']['value'])) {
            $totalFiltered = $modelClass::find()
                    ->tenant()
                    ->active()
                    ->andFilterWhere([
                        'OR',
                            ['like', 'pha_brand.brand_name', $requestData['search']['value']],
                            ['like', 'pha_brand.brand_code', $requestData['search']['value']],
                    ])
                    ->count();

            $brands = $modelClass::find()
                    ->tenant()
                    ->active()
                    ->andFilterWhere([
                        'OR',
                            ['like', 'pha_brand.brand_name', $requestData['search']['value']],
                            ['like', 'pha_brand.brand_code', $requestData['search']['value']],
                    ])
                    ->limit($requestData['length'])
                    ->offset($requestData['start'])
                    ->orderBy($order_array)
                    ->all();
        } else {
            $brands = $modelClass::find()
                    ->tenant()
                    ->active()
                    ->limit($requestData['length'])
                    ->offset($requestData['start'])
                    ->orderBy($order_array)
                    ->all();
        }

        $data = array();
        foreach ($brands as $brand) {
            $nestedData = array();
            $nestedData['brand_name'] = $brand->brand_name;
            $nestedData['brand_code'] = $brand->brand_code;
            $nestedData['status'] = $brand->status;
            $nestedData['brand_id'] = $brand->brand_id;
            $data[] = $nestedData;
        }

        $json_data = array(
            "draw" => intval($requestData['draw']),
            "recordsTotal" => intval($totalData),
            "recordsFiltered" => intval($totalFiltered),
            "data" => $data   // total data array
        );

        echo json_encode($json_data);
    }

}
