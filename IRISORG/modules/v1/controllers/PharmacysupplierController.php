<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PhaSupplier;
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
class PharmacysupplierController extends ActiveController {

    public $modelClass = 'common\models\PhaSupplier';

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
        if($id){
            $model = PhaSupplier::find()->where(['supplier_id' => $id])->one();
            $model->remove();
            $activity = 'Supplier Deleted Successfully (#' . $model->supplier_name . ' )';
            CoAuditLog::insertAuditLog(PhaSupplier::tableName(), $id, $activity);
            return ['success' => true];
        }
    }
    
    public function actionGetsupplierlist() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['tenant']))
            $tenant = $get['tenant'];

        if (isset($get['status']))
            $status = strval($get['status']);

        if (isset($get['deleted']))
            $deleted = $get['deleted'] == 'true';

        return ['supplierList' => PhaSupplier::getSupplierlist($tenant, $status, $deleted)];
    }
    
    public function actionGetsupplierdetails()
    {
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
                        ['like', 'supplier_name', $requestData['search']['value']],
                        ['like', 'supplier_mobile', $requestData['search']['value']],
                        ['like', 'cst_no', $requestData['search']['value']],
                        ['like', 'tin_no', $requestData['search']['value']],
                    ])
                    ->count();

            $suppliers = $modelClass::find()
                    ->tenant()
                    ->active()
                    ->andFilterWhere([
                        'OR',
                        ['like', 'supplier_name', $requestData['search']['value']],
                        ['like', 'supplier_mobile', $requestData['search']['value']],
                        ['like', 'cst_no', $requestData['search']['value']],
                        ['like', 'tin_no', $requestData['search']['value']],
                    ])
                    ->limit($requestData['length'])
                    ->offset($requestData['start'])
                    ->orderBy($order_array)
                    ->all();
        } else {
            $suppliers = $modelClass::find()
                    ->tenant()
                    ->active()
                    ->limit($requestData['length'])
                    ->offset($requestData['start'])
                    ->orderBy($order_array)
                    ->all();
        }

        $data = array();
        foreach ($suppliers as $supplier) {
            $nestedData = array();
            $nestedData['supplier_name'] = $supplier->supplier_name;
            $nestedData['supplier_mobile'] = $supplier->supplier_mobile;
            $nestedData['cst_no'] = $supplier->cst_no;
            $nestedData['tin_no'] = $supplier->tin_no;
            $nestedData['status'] = $supplier->status;
            $nestedData['supplier_id'] = $supplier->supplier_id;
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
