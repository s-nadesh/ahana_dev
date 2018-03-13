<?php

namespace common\models;

use common\models\query\PhaProductBatchRateQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pha_product_batch_rate".
 *
 * @property integer $batch_rate_id
 * @property integer $tenant_id
 * @property integer $batch_id
 * @property string $mrp
 * @property string $per_unit_price
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PhaProductBatch $batch
 * @property CoTenant $tenant
 */
class PhaProductBatchRate extends PActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pha_product_batch_rate';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['tenant_id', 'batch_id', 'mrp', 'created_by'], 'required'],
            [['tenant_id', 'batch_id', 'created_by', 'modified_by'], 'integer'],
            [['mrp', 'per_unit_price'], 'number'],
            [['status'], 'string'],
            [['created_at', 'modified_at', 'deleted_at'], 'safe']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'batch_rate_id' => 'Batch Rate ID',
            'tenant_id' => 'Tenant ID',
            'batch_id' => 'Batch ID',
            'mrp' => 'Mrp',
            'per_unit_price' => 'Per Unit Price',
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
    public function getBatch() {
        return $this->hasOne(PhaProductBatch::className(), ['batch_id' => 'batch_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new PhaProductBatchRateQuery(get_called_class());
    }

}
