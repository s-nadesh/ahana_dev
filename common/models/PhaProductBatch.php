<?php

namespace common\models;

use common\models\query\PhaProductBatchQuery;
use yii\db\ActiveQuery;
use Yii;

/**
 * This is the model class for table "pha_product_batch".
 *
 * @property integer $batch_id
 * @property integer $tenant_id
 * @property integer $product_id
 * @property string $batch_no
 * @property string $expiry_date
 * @property integer $package_unit
 * @property string $package_name
 * @property integer $total_qty
 * @property integer $available_qty
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PhaProduct $product
 * @property CoTenant $tenant
 * @property PhaProductBatchRate[] $phaProductBatchRates
 */
class PhaProductBatch extends RActiveRecord {

    public $product_name;
    public $product_code;
    public $mrp;
    public $qty;
    public $supplier_id_1;
    public $supplier_id_2;
    public $supplier_id_3;
    public $product_reorder_min;
    public $stock_adjust = false;
    public $batch_detail = false;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_product_batch';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['tenant_id', 'product_id', 'batch_no', 'expiry_date', 'total_qty', 'available_qty', 'created_by'], 'required'],
                [['tenant_id', 'product_id', 'total_qty', 'available_qty', 'created_by', 'modified_by'], 'integer'],
                [['expiry_date', 'created_at', 'modified_at', 'deleted_at', 'package_unit', 'package_name'], 'safe'],
                [['status'], 'string'],
                [['batch_no'], 'string', 'max' => 255],
                [['batch_no'], 'unique', 'targetAttribute' => ['tenant_id', 'product_id', 'batch_no', 'expiry_date', 'deleted_at'], 'message' => 'The combination of Batch NO. & Expiry Date has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'batch_id' => 'Batch ID',
            'tenant_id' => 'Tenant ID',
            'product_id' => 'Product ID',
            'batch_no' => 'Batch No',
            'expiry_date' => 'Expiry Date',
            'total_qty' => 'Total Qty',
            'available_qty' => 'Available Qty',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getProduct() {
        return $this->hasOne(PhaProduct::className(), ['product_id' => 'product_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getPhaProductBatchRate() {
        return $this->hasOne(PhaProductBatchRate::className(), ['batch_id' => 'batch_id']);
    }

    public function getPhaProductBatchRates() {
        return $this->hasMany(PhaProductBatchRate::className(), ['batch_id' => 'batch_id'])->orderBy(['created_at' => SORT_DESC]);
    }

    public function getPhaPurchaseItem() {
        return $this->hasOne(PhaPurchaseItem::className(), ['batch_id' => 'batch_id'], ['product_id' => 'product_id'])->orderBy(['created_at' => SORT_DESC]);
    }

    public static function find() {
        return new PhaProductBatchQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'batch_details' => function ($model) {
                return $model->batch_no . ' (' . date('M Y', strtotime($model->expiry_date)) . ')' . ' / ' . $model->available_qty;
            },
            'mrp' => function ($model) {
                return isset($model->phaProductBatchRate) ? $model->phaProductBatchRate->mrp : 0;
            },
            'purchase_rate' => function ($model) {
                return isset($model->phaPurchaseItem) ? $model->phaPurchaseItem->purchase_rate : '-';
            },
            'per_unit_price' => function ($model) {
                return isset($model->phaProductBatchRate) ? $model->phaProductBatchRate->per_unit_price : 0;
            },
            'product' => function ($model) {
                return isset($model->product) ? $model->product : '';
            },
            'product_name' => function ($model) {
                return isset($model->product) ? $model->product->product_name : '';
            },
            'originalQuantity' => function ($model) {
                return isset($model->available_qty) ? $model->available_qty : '';
            }
        ];
        $parent_fields = parent::fields();
        $addt_keys = $extFields = [];
        if ($addtField = Yii::$app->request->get('addtfields')) {
            switch ($addtField):
                case 'sale_batch_by_product':
                case 'pharm_sale_prod_json':
                    $addt_keys = ['batch_details', 'per_unit_price', 'originalQuantity'];
                    $pFields = ['batch_no', 'available_qty', 'product_id', 'expiry_date'];
                    $parent_fields = array_combine($pFields, $pFields);
                    break;
                case 'sale_update':
                    $addt_keys = ['batch_details'];
                    $pFields = ['batch_no', 'available_qty', 'expiry_date'];
                    $parent_fields = array_combine($pFields, $pFields);
                    break;
                case 'sale_print':
                    $addt_keys = ['batch_details'];
                    $pFields = ['batch_no', 'expiry_date'];
                    $parent_fields = array_combine($pFields, $pFields);
                    break;
                case 'pharm_purchase_prod_json':
                    $addt_keys = ['batch_details', 'mrp'];
                    $pFields = ['batch_no', 'available_qty', 'product_id', 'expiry_date', 'package_name'];
                    $parent_fields = array_combine($pFields, $pFields);
                    break;
                case 'purchase_update':
                    $addt_keys = ['batch_details', 'mrp'];
                    $pFields = ['batch_no', 'available_qty', 'expiry_date'];
                    $parent_fields = array_combine($pFields, $pFields);
                    break;
                case 'viewlist':
                    $addt_keys = ['batch_details'];
                    $pFields = ['batch_no', 'expiry_date'];
                    $parent_fields = array_combine($pFields, $pFields);
                    break;
                case 'purchase_print':
                    $addt_keys = ['batch_details'];
                    $pFields = ['batch_no', 'expiry_date'];
                    $parent_fields = array_combine($pFields, $pFields);
                    break;
                case 'prescregister':
                    $addt_keys = ['batch_details'];
                    $pFields = ['batch_no', 'expiry_date'];
                    $parent_fields = array_combine($pFields, $pFields);
                    break;
                case 'sale_return':
                    $addt_keys = ['batch_details'];
                    $pFields = ['batch_id', 'batch_no', 'available_qty', 'expiry_date'];
                    $parent_fields = array_combine($pFields, $pFields);
                    break;
                case 'sale_return_list':
                    $addt_keys = ['batch_details'];
                    $pFields = ['batch_id', 'batch_no', 'available_qty', 'expiry_date'];
                    $parent_fields = array_combine($pFields, $pFields);
                    break;
                case 'stock_details':
                    $addt_keys = ['batch_details', 'mrp', 'product', 'purchase_rate'];
                    $pFields = ['batch_id', 'batch_no', 'available_qty', 'expiry_date', 'package_name'];
                    $parent_fields = array_combine($pFields, $pFields);
                    break;
                case 'expiry_report':
                    $addt_keys = ['product_name'];
                    $pFields = ['batch_id', 'batch_no', 'expiry_date'];
                    $parent_fields = array_combine($pFields, $pFields);
                    break;
                case 'purchase_return':
                    $addt_keys = ['batch_details'];
                    $pFields = ['batch_id', 'batch_no', 'expiry_date', 'available_qty', 'expiry_date'];
                    $parent_fields = array_combine($pFields, $pFields);
            endswitch;
        }

        if ($addt_keys !== false)
            $extFields = ($addt_keys) ? array_intersect_key($extend, array_flip($addt_keys)) : $extend;

        return array_merge($parent_fields, $extFields);
    }

    public function beforeSave($insert) {
        $this->expiry_date = date('Y-m', strtotime($this->expiry_date)) . '-01';
        return parent::beforeSave($insert);
    }

    public function afterSave($insert, $changedAttributes) {
        if ($this->stock_adjust) {
            if ($changedAttributes['total_qty'] != $this->total_qty && $changedAttributes['available_qty'] != $this->available_qty) {
                $adjust_log = new PhaStockAdjustLog();
                $adjust_log->batch_id = $this->batch_id;
                $adjust_log->adjust_date_time = $this->modified_at;
                $adjust_log->adjust_from = $changedAttributes['available_qty'];
                $adjust_log->adjust_to = $this->available_qty;
                $adjust_log->adjust_qty = $adjust_log->adjust_to - $adjust_log->adjust_from;
                $adjust_log->save(false);
            }
            $activity = 'Stock Adjust Updated Successfully (#' . $this->batch_no . ' )';
            CoAuditLog::insertAuditLog(PhaProductBatch::tableName(), $this->batch_id, $activity);
        }
        if ($this->batch_detail) {
            $activity = 'Batch Details Updated Successfully (#' . $this->batch_no . ' )';
            CoAuditLog::insertAuditLog(PhaProductBatch::tableName(), $this->batch_id, $activity);
        }

        return parent::afterSave($insert, $changedAttributes);
    }

}
