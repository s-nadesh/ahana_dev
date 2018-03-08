<?php

namespace common\models;

use common\models\query\PhaReorderHistoryItemQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pha_reorder_history_item".
 *
 * @property integer $reorder_item_id
 * @property integer $tenant_id
 * @property integer $reorder_id
 * @property integer $product_id
 * @property integer $quantity
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PhaProduct $product
 * @property PhaReorderHistory $reorder
 * @property CoTenant $tenant
 */
class PhaReorderHistoryItem extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_reorder_history_item';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['product_id', 'quantity'], 'required'],
            [['tenant_id', 'reorder_id', 'product_id', 'quantity', 'created_by', 'modified_by'], 'integer'],
            [['status'], 'string'],
            [['created_at', 'modified_at', 'deleted_at'], 'safe']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'reorder_item_id' => 'Reorder Item ID',
            'tenant_id' => 'Tenant ID',
            'reorder_id' => 'Reorder ID',
            'product_id' => 'Product ID',
            'quantity' => 'Quantity',
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
    public function getReorder() {
        return $this->hasOne(PhaReorderHistory::className(), ['reorder_id' => 'reorder_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public function fields() {
        $extend = [
            'product' => function ($model) {
                return (isset($model->product) ? $model->product : '-');
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public static function find() {
        return new PhaReorderHistoryItemQuery(get_called_class());
    }
}
